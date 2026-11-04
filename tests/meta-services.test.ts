import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'proofloop-meta-tests-'));
const databasePath = path.join(temporaryDirectory, 'test-db.json');
const originalFetch = globalThis.fetch;
process.env.PROOFLOOP_DB_FILE = databasePath;
process.env.MODEL_API_KEY = 'test-key-not-a-real-credential';
process.env.META_BASE_URL = 'https://api.meta.ai/v1';

const [{ db, getInitialDemoState }, spark, sam, voice, verification] = await Promise.all([
  import('../server/db.js'),
  import('../server/src/services/meta/museSparkService.js'),
  import('../server/src/services/meta/samService.js'),
  import('../server/src/services/meta/museVoiceService.js'),
  import('../server/src/services/meta/verificationOrchestrator.js'),
]);

beforeEach(() => {
  db.resetDemo();
});

after(() => {
  globalThis.fetch = originalFetch;
  delete process.env.PROOFLOOP_DB_FILE;
  delete process.env.MODEL_API_KEY;
  delete process.env.META_BASE_URL;
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

const plannedResponse = {
  projectName: 'Venue Setup',
  summary: 'Prepare a safe event venue.',
  tasks: [{
    title: 'Arrange chairs',
    description: 'Arrange seats in the auditorium.',
    acceptanceCriteria: ['Chairs are visible in the designated area.'],
    evidenceRequirements: ['Wide-angle venue photo.'],
    dependencies: [],
    priority: 'high',
    verificationMethod: 'Visual review with image segmentation.',
  }],
};

test('seeded examples never present simulated evidence as live verification', () => {
  const state = getInitialDemoState();

  assert.ok(state.tasks.every((task) => task.status === 'AWAITING_EVIDENCE'));
  assert.ok(state.tasks.every((task) => task.acceptanceCriteria.every((criterion) => criterion.status === 'PENDING')));
  assert.ok(state.evidence.every((item) => item.analysisStatus === 'PENDING' && item.detections.length === 0));
  assert.ok(state.verifications.every(
    (item) => item.modelInformation.isSimulation && item.aiStatus === 'NEEDS_REVIEW' && item.humanDecision === 'PENDING',
  ));
  assert.ok(state.projects.every((project) => project.stats?.verifiedTasks === 0));
});

function responseBody(output: string, model = 'muse-spark-1.3') {
  return {
    id: 'resp_test',
    object: 'response',
    created_at: 1,
    status: 'completed',
    model,
    output: [{
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'output_text', text: output, annotations: [] }],
    }],
    usage: { input_tokens: 12, output_tokens: 8, total_tokens: 20 },
  };
}

function jsonResponse(output: string) {
  return new Response(JSON.stringify(responseBody(output)), {
    status: 200,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req_test' },
  });
}

function sseResponse(outputText: string) {
  const events = [
    { type: 'response.output_text.delta', item_id: 'msg_test', output_index: 0, content_index: 0, delta: outputText },
    { type: 'response.output_text.done', item_id: 'msg_test', output_index: 0, content_index: 0, text: outputText },
    { type: 'response.completed', response: responseBody(outputText, 'sam-3.1') },
  ];
  return new Response(`${events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('')}data: [DONE]\n\n`, {
    status: 200,
    headers: { 'content-type': 'text/event-stream', 'x-request-id': 'req_sam_test' },
  });
}

function mockFetch(handler: typeof fetch): void {
  globalThis.fetch = handler;
}

test('Muse Spark live connection test uses Responses API and retries rate limits', async () => {
  let calls = 0;
  mockFetch((async () => {
    calls += 1;
    if (calls === 1) return new Response('{"error":{"message":"rate limited"}}', { status: 429 });
    return jsonResponse('OK');
  }) as typeof fetch);

  assert.equal(await spark.testMuseSparkConnection(), 'OK');
  assert.equal(calls, 2);
  assert.equal(db.getAIExecutions()[0].status, 'COMPLETED');
  assert.equal(db.getAIExecutions()[0].requestId, 'req_test');
});

test('Muse Spark planning validates structured output and model metadata', async () => {
  mockFetch((async () => jsonResponse(JSON.stringify(plannedResponse))) as typeof fetch);
  const result = await spark.planInstructions('Arrange chairs.', 'Auditorium', 'Venue Setup');
  assert.equal(result.tasks[0].priority, 'HIGH');
  assert.equal(result.isSimulated, false);
  assert.equal(result.model, 'muse-spark-1.3');
  assert.equal(db.getAIExecutions()[0].usage?.totalTokens, 20);
});

test('Muse Spark rejects output that does not match the task plan schema', async () => {
  mockFetch((async () => jsonResponse(JSON.stringify({ tasks: [] }))) as typeof fetch);
  await assert.rejects(() => spark.planInstructions('Plan an event.'));
  assert.equal(db.getAIExecutions()[0].status, 'FAILED');
});

test('SAM service segments an image and parses its returned mask', async () => {
  const segmentation = "<0f>0<|box;x1=211;y1=228;x2=270;y2=254;w=537;h=561|><|mask;x=0;y=0;data=27,60,~!!!!M!0c[0o91w?q1!pIH4pPRVp2B3'7`e.ioeAf6-k/#Xd8%dX9x(|>";
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL5sAAAAASUVORK5CYII=', 'base64');
  let body: Record<string, unknown> | undefined;
  mockFetch((async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return sseResponse(segmentation);
  }) as typeof fetch);

  const result = await sam.segmentImage(image, 'image/png', 'chair', 'evidence:test');
  assert.equal(body?.model, 'sam-3.1');
  assert.equal(body?.stream, true);
  assert.equal(result.detections.length, 1);
  assert.equal(result.detections[0].label, 'chair');
  assert.ok(result.detections[0].mask?.path);
  assert.equal(db.getAIExecutions()[0].status, 'COMPLETED');
});

test('SAM parser decodes a returned mask to an SVG overlay and binary raster', async () => {
  const output = "<0f>0<|box;x1=211;y1=228;x2=270;y2=254;w=537;h=561|><|mask;x=0;y=0;data=27,60,~!!!!M!0c[0o91w?q1!pIH4pPRVp2B3'7`e.ioeAf6-k/#Xd8%dX9x(|>";
  async function* events() {
    yield { type: 'response.output_text.delta', item_id: 'msg', output_index: 0, content_index: 0, delta: output };
    yield { type: 'response.output_text.done', item_id: 'msg', output_index: 0, content_index: 0, text: output };
    yield { type: 'response.completed' };
  }
  const result = await sam.parseSamStream(events(), 537, 561, 'chair', 'evidence:mask');
  assert.equal(result.detections.length, 1);
  assert.ok(result.detections[0].mask?.path);
  assert.equal(result.detections[0].mask?.width, 60);
  assert.equal(result.detections[0].mask?.height, 27);
});

test('SAM treats a completed response with no matches as an empty result', async () => {
  mockFetch((async () => sseResponse('')) as typeof fetch);
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL5sAAAAASUVORK5CYII=', 'base64');
  const result = await sam.segmentImage(image, 'image/png', 'chair', 'evidence:none');
  assert.deepEqual(result.detections, []);
});

test('Muse Voice sends a WAV multipart request and returns the actual transcript', async () => {
  const wav = Buffer.alloc(44);
  wav.write('RIFF', 0);
  wav.write('WAVE', 8);
  let requestJson: Record<string, unknown> | undefined;
  mockFetch((async (_input, init) => {
    const form = init?.body as FormData;
    requestJson = JSON.parse(await (form.get('request') as Blob).text());
    assert.equal((form.get('audio') as File).type, 'audio/wav');
    return new Response(JSON.stringify({ turns: [{ transcript: 'Arrange chairs safely.' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch);

  const result = await voice.transcribeWav(wav);
  assert.equal(requestJson?.model, 'muse-voice-transcribe-1.0');
  assert.equal(requestJson?.audioEncoding, 'WAV');
  assert.equal(result.transcript, 'Arrange chairs safely.');
});

test('Meta API errors are sanitized and never expose credentials', async () => {
  mockFetch((async () => new Response(JSON.stringify({
    error: { message: 'invalid test-key-not-a-real-credential' },
  }), { status: 401, headers: { 'content-type': 'application/json' } })) as typeof fetch);

  await assert.rejects(() => spark.testMuseSparkConnection(), /Meta Model API rejected the server credentials/);
  assert.equal(db.getAIExecutions()[0].status, 'FAILED');
  assert.ok(!JSON.stringify(db.getAIExecutions()).includes(process.env.MODEL_API_KEY!));
});

test('verification routes non-visual claims to review even if the model supports them', async () => {
  const task = db.getTaskById('task-projector');
  assert.ok(task);
  task.title = 'Test the projector';
  task.acceptanceCriteria = [{ id: 'criterion-test', text: 'The projector is operational.', status: 'PENDING' }];
  const evidence = {
    id: 'evidence-real-test',
    taskId: task.id,
    projectId: task.projectId,
    fileUrl: '/uploads/actual.jpg',
    fileName: 'actual.jpg',
    fileType: 'image/jpeg',
    fileSize: 10,
    uploadedBy: 'test',
    uploadedByName: 'Test',
    uploadedAt: new Date().toISOString(),
    analysisStatus: 'ANALYZED' as const,
    detections: [{ id: 'd1', label: 'projector', confidence: 0.9, bbox: [0, 0, 100, 100] as [number, number, number, number], color: '#000000' }],
    metadata: { analysisModel: 'sam-3.1' },
  };
  mockFetch((async () => jsonResponse(JSON.stringify({
    criteriaResults: [{
      criterion: 'The projector is operational.',
      result: 'supported',
      explanation: 'A projector was segmented.',
      evidenceReferences: [evidence.id],
    }],
    overallStatus: 'verified',
    missingEvidence: [],
    uncertainties: [],
    recommendedAction: 'Confirm with a functional test.',
  }))) as typeof fetch);

  const result = await verification.verifyTaskEvidence(task, [evidence]);
  assert.equal(result.aiStatus, 'NEEDS_REVIEW');
  assert.equal(result.criteriaResults[0].status, 'UNCERTAIN');
});

test('human review decisions persist with a database record', async () => {
  const task = db.getTaskById('task-chairs-50');
  assert.ok(task);
  const result = await verification.verifyTaskEvidence(task, []);
  db.addVerification(result);
  db.updateVerificationReview(result.id, {
    humanDecision: 'REQUEST_MORE_EVIDENCE',
    reviewerNotes: 'Please upload a full-room photo.',
    reviewedBy: 'reviewer-test',
    reviewedByName: 'Test Reviewer',
  });
  const saved = JSON.parse(readFileSync(databasePath, 'utf8'));
  assert.equal(saved.verifications[0].humanDecision, 'REQUEST_MORE_EVIDENCE');
  assert.equal(saved.verifications[0].reviewerNotes, 'Please upload a full-room photo.');
});
