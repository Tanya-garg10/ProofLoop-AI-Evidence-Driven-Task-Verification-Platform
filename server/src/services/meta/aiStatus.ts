import { db } from '../../../db.js';
import { META_MODELS, isMetaConfigured } from './metaClient.js';

function modelStatus(modelName: string, modelIdentifier: string) {
  const latestAttempt = db.getAIExecutions().find(
    (execution) => execution.modelIdentifier === modelIdentifier || execution.modelName === modelName,
  );
  const latestSuccess = db.getAIExecutions().find(
    (execution) =>
      execution.status === 'COMPLETED' &&
      (execution.modelIdentifier === modelIdentifier || execution.modelName === modelName),
  );
  return {
    model: modelIdentifier,
    configured: isMetaConfigured(),
    status: !isMetaConfigured()
      ? 'CONFIGURATION_REQUIRED'
      : latestAttempt?.status === 'COMPLETED'
        ? 'CONNECTED'
        : latestAttempt?.status === 'FAILED'
          ? 'ERROR'
          : 'READY_TO_TEST',
    lastSuccessfulRequest: latestSuccess?.completedAt,
  };
}

export function getMetaApiStatus() {
  const voice = modelStatus('Muse Voice Transcribe', META_MODELS.museVoice);
  const image = modelStatus('Muse Image', META_MODELS.museImage);
  return {
    metaMuseSpark: modelStatus('Muse Spark', META_MODELS.museSpark),
    metaSAM: modelStatus('SAM 3.1', META_MODELS.sam),
    metaMuseVoice: {
      ...voice,
      enabled: isMetaConfigured(),
    },
    metaMuseImage: {
      ...image,
      enabled: isMetaConfigured(),
      optional: true,
    },
  };
}
