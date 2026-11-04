import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import type { AIExecutionRecord } from '../../../../src/types/index.js';
import { db } from '../../../db.js';

const RETRYABLE_STATUS_CODES = new Set([408, 409, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;

export const META_MODELS = {
  get museSpark() { return process.env.MUSE_SPARK_MODEL || 'muse-spark-1.3'; },
  get sam() { return process.env.SAM_MODEL || 'sam-3.1'; },
  get museVoice() { return process.env.MUSE_VOICE_MODEL || 'muse-voice-transcribe-1.0'; },
  get museImage() { return process.env.MUSE_IMAGE_MODEL || 'muse-image-1.0'; },
};

export class MetaConfigurationError extends Error {
  constructor() {
    super('Meta Model API is not configured. Set MODEL_API_KEY on the server.');
    this.name = 'MetaConfigurationError';
  }
}

export function getMetaBaseUrl(): string {
  const baseUrl = process.env.META_BASE_URL || 'https://api.meta.ai/v1';
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error('Meta Model API base URL is invalid.');
  }
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
    throw new Error('Meta Model API base URL must use HTTPS.');
  }
  return parsed.toString().replace(/\/$/, '');
}

export function isMetaConfigured(): boolean {
  return Boolean(process.env.MODEL_API_KEY?.trim());
}

export function getMetaApiClient(): OpenAI {
  const apiKey = process.env.MODEL_API_KEY?.trim();
  if (!apiKey) throw new MetaConfigurationError();
  return new OpenAI({
    apiKey,
    baseURL: getMetaBaseUrl(),
    timeout: 60_000,
    maxRetries: 0,
  });
}

export function safeMetaError(error: unknown): string {
  if (error instanceof MetaConfigurationError) return error.message;
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? Number(error.status)
    : undefined;
  if (status === 401) return 'Meta Model API rejected the server credentials.';
  if (status === 403) return 'The configured Meta account is not permitted to use this model.';
  if (status === 429) return 'Meta Model API rate limit reached. Try again shortly.';
  if (status && status >= 500) return 'Meta Model API is temporarily unavailable.';
  if (status && status >= 400) return `Meta Model API rejected the request (HTTP ${status}).`;
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'APIConnectionTimeoutError')) {
    return 'Meta Model API request timed out.';
  }
  return 'Meta Model API request failed.';
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined;
  const status = Number(error.status);
  return Number.isFinite(status) ? status : undefined;
}

function isRetryable(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status !== undefined) return RETRYABLE_STATUS_CODES.has(status);
  return error instanceof OpenAI.APIConnectionError;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withMetaRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS - 1 || !isRetryable(error)) throw error;
      const retryAfterValue = error instanceof OpenAI.APIError
        ? Number(error.headers?.get('retry-after')) * 1000
        : 0;
      const retryAfter = Number.isFinite(retryAfterValue) ? retryAfterValue : 0;
      await wait(Math.min(retryAfter || 400 * 2 ** attempt, 5000));
    }
  }
}

export async function runMetaOperation<T>(
  modelName: string,
  modelIdentifier: string,
  operation: string,
  inputReferences: string[],
  invoke: () => Promise<{ value: T; requestId?: string; usage?: Record<string, number> }>,
  preview: (value: T) => string
): Promise<T> {
  const startedAt = new Date();
  const id = randomUUID();
  const entry: AIExecutionRecord = {
    id,
    modelName,
    modelIdentifier,
    operation,
    inputReferences,
    status: 'RUNNING',
    startedAt: startedAt.toISOString(),
  };
  db.addAIExecution(entry);

  try {
    const result = await invoke();
    const completedAt = new Date();
    db.updateAIExecution(id, {
      requestId: result.requestId,
      outputPreview: preview(result.value).slice(0, 240),
      usage: result.usage,
      status: 'COMPLETED',
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    });
    return result.value;
  } catch (error) {
    const completedAt = new Date();
    const safeMessage = safeMetaError(error);
    db.updateAIExecution(id, {
      status: 'FAILED',
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      error: safeMessage,
    });
    if (error instanceof MetaConfigurationError) throw error;
    const safeError = new Error(safeMessage);
    safeError.name = 'MetaApiError';
    const status = getErrorStatus(error);
    if (status !== undefined) Object.assign(safeError, { status });
    throw safeError;
  }
}
