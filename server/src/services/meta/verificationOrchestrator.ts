import type {
  AcceptanceCriterion,
  EvidenceItem,
  Task,
  TaskStatus,
  VerificationResult,
} from '../../../../src/types/index.js';
import { META_MODELS, isMetaConfigured } from './metaClient.js';
import { evaluateEvidence } from './museSparkService.js';

const NON_VISUAL_CRITERION =
  /\b(working|works|operational|function(?:al|s)?|signal|flicker|powered on|exactly \d+|at least \d+|all angles|every angle|from every angle|exit|egress|unobstructed|clearance)\b|\b\d+\b/i;

function awaitingEvidence(task: Task, evidence: EvidenceItem[]): VerificationResult {
  return {
    id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    taskId: task.id,
    projectId: task.projectId,
    evidenceIds: evidence.map((item) => item.id),
    aiStatus: evidence.length === 0 ? 'AWAITING_EVIDENCE' : 'NEEDS_REVIEW',
    aiExplanation: evidence.length === 0
      ? 'No evidence has been submitted for this task.'
      : 'Evidence is present, but no real SAM segmentation results are available for this task. Configure the Meta API and analyze evidence before verification.',
    uncertainty: {
      hasUncertainty: true,
      reason: evidence.length === 0
        ? 'No evidence files are available.'
        : 'No API-generated segmentation findings are available.',
      missingInformation: task.evidenceRequirements,
    },
    criteriaResults: task.acceptanceCriteria.map((criterion) => ({
      ...criterion,
      status: evidence.length === 0 ? 'PENDING' : 'INSUFFICIENT_EVIDENCE',
      finding: evidence.length === 0 ? 'Awaiting evidence upload.' : 'No actual SAM segmentation result is attached.',
    })),
    modelInformation: {
      plannerModel: META_MODELS.museSpark,
      visionModel: META_MODELS.sam,
      segmentationModel: META_MODELS.sam,
      isSimulation: false,
      providerNote: isMetaConfigured()
        ? 'Verification requires API-generated segmentation findings.'
        : 'Meta Model API configuration is required. No simulated verification was produced.',
    },
    humanDecision: 'PENDING',
    createdAt: new Date().toISOString(),
  };
}

function criterionResults(
  task: Task,
  evidence: EvidenceItem[],
  modelResults: Awaited<ReturnType<typeof evaluateEvidence>>['criteriaResults'],
): AcceptanceCriterion[] {
  return task.acceptanceCriteria.map((criterion) => {
    const result = modelResults.find((item) => item.criterion === criterion.text);
    if (!result) {
      return {
        ...criterion,
        status: 'INSUFFICIENT_EVIDENCE',
        finding: 'The model did not return a result for this criterion.',
      };
    }

    const references = result.evidenceReferences.filter((id) => evidence.some((item) => item.id === id));
    const requiresNonVisualProof = NON_VISUAL_CRITERION.test(criterion.text);
    const status: AcceptanceCriterion['status'] = requiresNonVisualProof
      ? 'UNCERTAIN'
      : references.length === 0
        ? 'INSUFFICIENT_EVIDENCE'
      : result.result === 'supported'
        ? 'PASSED'
        : result.result === 'contradicted'
          ? 'FAILED'
          : result.result === 'insufficient_evidence'
            ? 'INSUFFICIENT_EVIDENCE'
            : 'UNCERTAIN';
    const finding = requiresNonVisualProof
      ? `${result.explanation} Static visual segmentation cannot establish operation, full counts, or visibility from every angle.`
      : result.explanation;
    return {
      ...criterion,
      status,
      finding,
      ...(status === 'UNCERTAIN' || status === 'INSUFFICIENT_EVIDENCE'
        ? { uncertaintyReason: requiresNonVisualProof ? 'Requires non-visual or more complete evidence.' : result.explanation }
        : {}),
      detectedObjects: references.length > 0
        ? evidence.filter((item) => references.includes(item.id)).flatMap((item) => item.detections.map((detection) => detection.label))
        : [],
    };
  });
}

export async function verifyTaskEvidence(task: Task, evidence: EvidenceItem[]): Promise<VerificationResult> {
  if (evidence.length === 0 || !isMetaConfigured()) return awaitingEvidence(task, evidence);
  const analyzed = evidence.filter(
    (item) => item.metadata?.analysisModel === META_MODELS.sam && item.analysisStatus === 'ANALYZED',
  );
  if (analyzed.length === 0) return awaitingEvidence(task, evidence);

  const reasoning = await evaluateEvidence(task, analyzed);
  const criteria = criterionResults(task, analyzed, reasoning.criteriaResults);
  let aiStatus: TaskStatus;
  if (criteria.some((criterion) => criterion.status === 'FAILED')) {
    aiStatus = 'INCOMPLETE';
  } else if (criteria.every((criterion) => criterion.status === 'PASSED') && reasoning.overallStatus === 'verified') {
    aiStatus = 'VERIFIED';
  } else {
    aiStatus = 'NEEDS_REVIEW';
  }

  return {
    id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    taskId: task.id,
    projectId: task.projectId,
    evidenceIds: analyzed.map((item) => item.id),
    aiStatus,
    aiExplanation: reasoning.recommendedAction,
    uncertainty: {
      hasUncertainty: criteria.some((criterion) => criterion.status === 'UNCERTAIN' || criterion.status === 'INSUFFICIENT_EVIDENCE'),
      reason: reasoning.uncertainties.join(' ') || undefined,
      missingInformation: reasoning.missingEvidence,
    },
    criteriaResults: criteria,
    modelInformation: {
      plannerModel: META_MODELS.museSpark,
      visionModel: META_MODELS.sam,
      segmentationModel: META_MODELS.sam,
      isSimulation: false,
      providerNote: 'Muse Spark evaluated the actual SAM findings. Static-image limits were enforced by the verification orchestrator.',
    },
    humanDecision: 'PENDING',
    createdAt: new Date().toISOString(),
  };
}
