import { z } from 'zod';
import type {
  AIPlanGeneratedTask,
  AIPlanResponse,
  AcceptanceCriterion,
  EvidenceItem,
  Task,
} from '../../../../src/types/index.js';
import { db } from '../../../db.js';
import { getMetaApiClient, META_MODELS, runMetaOperation, withMetaRetry } from './metaClient.js';

const planSchema = z.object({
  projectName: z.string().min(1),
  summary: z.string().min(1),
  tasks: z.array(z.object({
    title: z.string().min(1),
    description: z.string(),
    acceptanceCriteria: z.array(z.string().min(1)),
    evidenceRequirements: z.array(z.string().min(1)),
    dependencies: z.array(z.string()),
    priority: z.enum(['low', 'medium', 'high']),
    verificationMethod: z.string(),
  }).strict()),
}).strict();

const planJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['projectName', 'summary', 'tasks'],
  properties: {
    projectName: { type: 'string' },
    summary: { type: 'string' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'description', 'acceptanceCriteria', 'evidenceRequirements', 'dependencies', 'priority', 'verificationMethod'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          acceptanceCriteria: { type: 'array', items: { type: 'string' } },
          evidenceRequirements: { type: 'array', items: { type: 'string' } },
          dependencies: { type: 'array', items: { type: 'string' } },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          verificationMethod: { type: 'string' },
        },
      },
    },
  },
};

const reasoningSchema = z.object({
  criteriaResults: z.array(z.object({
    criterion: z.string(),
    result: z.enum(['supported', 'contradicted', 'insufficient_evidence', 'uncertain']),
    explanation: z.string(),
    evidenceReferences: z.array(z.string()),
  }).strict()),
  overallStatus: z.enum(['verified', 'incomplete', 'needs_review', 'awaiting_evidence']),
  missingEvidence: z.array(z.string()),
  uncertainties: z.array(z.string()),
  recommendedAction: z.string(),
}).strict();

const reasoningJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['criteriaResults', 'overallStatus', 'missingEvidence', 'uncertainties', 'recommendedAction'],
  properties: {
    criteriaResults: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['criterion', 'result', 'explanation', 'evidenceReferences'],
        properties: {
          criterion: { type: 'string' },
          result: { type: 'string', enum: ['supported', 'contradicted', 'insufficient_evidence', 'uncertain'] },
          explanation: { type: 'string' },
          evidenceReferences: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    overallStatus: { type: 'string', enum: ['verified', 'incomplete', 'needs_review', 'awaiting_evidence'] },
    missingEvidence: { type: 'array', items: { type: 'string' } },
    uncertainties: { type: 'array', items: { type: 'string' } },
    recommendedAction: { type: 'string' },
  },
};

function toPlanResponse(value: z.infer<typeof planSchema>): AIPlanResponse {
  return {
    ...value,
    tasks: value.tasks.map((task) => ({
      ...task,
      priority: task.priority.toUpperCase() as AIPlanGeneratedTask['priority'],
    })),
    model: META_MODELS.museSpark,
    isSimulated: false,
  };
}

function responseUsage(usage: { input_tokens?: number; output_tokens?: number; total_tokens?: number } | null | undefined) {
  if (!usage) return undefined;
  return {
    ...(usage.input_tokens !== undefined ? { inputTokens: usage.input_tokens } : {}),
    ...(usage.output_tokens !== undefined ? { outputTokens: usage.output_tokens } : {}),
    ...(usage.total_tokens !== undefined ? { totalTokens: usage.total_tokens } : {}),
  };
}

export async function planInstructions(
  instructions: string,
  context?: string,
  projectName?: string,
): Promise<AIPlanResponse> {
  return runMetaOperation('Muse Spark', META_MODELS.museSpark, 'task_planning', [], async () => {
    const response = await withMetaRetry(() => getMetaApiClient().responses.create({
      model: META_MODELS.museSpark,
      input: [
        {
          role: 'system',
          content: `Plan operational instructions into discrete tasks. Return only the required schema.
Use measurable acceptance criteria and specific evidence requirements. Do not claim that a still image can prove operation, safety from every angle, or a complete count when the evidence cannot establish it.`,
        },
        {
          role: 'user',
          content: `Project name: ${projectName || 'Operational Execution Plan'}\nContext: ${context || 'General operational setup'}\nInstructions:\n${instructions}`,
        },
      ],
      text: { format: { type: 'json_schema', name: 'proofloop_task_plan', strict: true, schema: planJsonSchema } },
    }));
    const parsed = planSchema.parse(JSON.parse(response.output_text));
    return {
      value: toPlanResponse(parsed),
      requestId: response._request_id || undefined,
      usage: responseUsage(response.usage),
    };
  }, (value) => `${value.tasks.length} tasks planned: ${value.tasks.slice(0, 3).map((task) => task.title).join(', ')}`);
}

export async function revisePlan(
  currentPlan: unknown,
  revisionRequest: string,
): Promise<AIPlanResponse> {
  const original = currentPlan as Partial<AIPlanResponse>;
  const validatedPlan = planSchema.parse({
    projectName: original.projectName,
    summary: original.summary,
    tasks: original.tasks?.map((task) => ({
      ...task,
      priority: typeof task.priority === 'string' ? task.priority.toLowerCase() : task.priority,
    })),
  });
  return runMetaOperation('Muse Spark', META_MODELS.museSpark, 'task_revision', [], async () => {
    const response = await withMetaRetry(() => getMetaApiClient().responses.create({
      model: META_MODELS.museSpark,
      input: [
        {
          role: 'system',
          content: 'Revise the supplied operational plan according to the user request. Return the complete revised plan using the required schema. Keep criteria measurable and do not remove unrelated tasks.',
        },
        {
          role: 'user',
          content: `Existing plan:\n${JSON.stringify(validatedPlan)}\n\nRequested revision:\n${revisionRequest}`,
        },
      ],
      text: { format: { type: 'json_schema', name: 'proofloop_revised_plan', strict: true, schema: planJsonSchema } },
    }));
    return {
      value: toPlanResponse(planSchema.parse(JSON.parse(response.output_text))),
      requestId: response._request_id || undefined,
      usage: responseUsage(response.usage),
    };
  }, (value) => `Revised plan contains ${value.tasks.length} tasks.`);
}

export const evidenceReasoningSchema = reasoningSchema;

export async function evaluateEvidence(
  task: Task,
  evidence: EvidenceItem[],
): Promise<z.infer<typeof reasoningSchema>> {
  return runMetaOperation(
    'Muse Spark',
    META_MODELS.museSpark,
    'evidence_reasoning',
    [`task:${task.id}`, ...evidence.map((item) => `evidence:${item.id}`)],
    async () => {
      const response = await withMetaRetry(() => getMetaApiClient().responses.create({
        model: META_MODELS.museSpark,
        input: [
          {
            role: 'system',
            content: `Evaluate each criterion independently using only the supplied segmentation findings and evidence metadata.
SAM identifies image regions; it does not prove that equipment works, that an exit is accessible from every angle, or that a partial image contains a complete count.
Use "supported" only when the evidence can establish the full criterion. Use "insufficient_evidence" or "uncertain" instead of guessing. Every evidence reference must be one of the supplied evidence IDs.`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              task: { id: task.id, title: task.title, description: task.description },
              acceptanceCriteria: task.acceptanceCriteria.map((criterion: AcceptanceCriterion) => criterion.text),
              evidence: evidence.map((item) => ({
                id: item.id,
                fileName: item.fileName,
                metadata: item.metadata,
                segmentationStatus: item.analysisStatus,
                findings: item.detections.map(({ label, confidence, bbox, attributes }) => ({
                  label,
                  confidence,
                  bbox,
                  attributes,
                })),
              })),
            }),
          },
        ],
        text: { format: { type: 'json_schema', name: 'proofloop_evidence_reasoning', strict: true, schema: reasoningJsonSchema } },
      }));
      return {
        value: reasoningSchema.parse(JSON.parse(response.output_text)),
        requestId: response._request_id || undefined,
        usage: responseUsage(response.usage),
      };
    },
    (value) => `Evidence reasoning: ${value.overallStatus}; ${value.criteriaResults.length} criteria evaluated.`,
  );
}

export async function testMuseSparkConnection(): Promise<string> {
  return runMetaOperation('Muse Spark', META_MODELS.museSpark, 'connection_test', [], async () => {
    const response = await withMetaRetry(() => getMetaApiClient().responses.create({
      model: META_MODELS.museSpark,
      input: [{ role: 'user', content: 'Reply with the single word OK.' }],
      max_output_tokens: 8,
    }));
    return {
      value: response.output_text,
      requestId: response._request_id || undefined,
      usage: responseUsage(response.usage),
    };
  }, () => 'Muse Spark responded to a live connection test.');
}
