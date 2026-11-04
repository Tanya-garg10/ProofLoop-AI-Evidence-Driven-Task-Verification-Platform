import { randomUUID } from 'crypto';
import { META_MODELS, runMetaOperation, safeMetaError, withMetaRetry, isMetaConfigured, getMetaBaseUrl } from './metaClient.js';

interface VoiceResponse {
  transcript?: string;
  turns?: Array<{ transcript?: string }>;
  sessionId?: string;
}

export async function transcribeWav(audio: Buffer): Promise<{ transcript: string; sessionId?: string }> {
  if (!audio.length) throw new Error('The audio recording is empty.');
  if (audio.length > 32 * 1024 * 1024) throw new Error('Audio recordings must be smaller than 32 MB.');
  if (audio.toString('ascii', 0, 4) !== 'RIFF' || audio.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Muse Voice Transcribe requires a WAV recording.');
  }

  return runMetaOperation('Muse Voice Transcribe', META_MODELS.museVoice, 'audio_transcription', [], async () => {
    if (!isMetaConfigured()) {
      const error = new Error('Meta Model API is not configured. Set MODEL_API_KEY on the server.');
      throw error;
    }
    const form = new FormData();
    form.append('request', new Blob([JSON.stringify({
      model: META_MODELS.museVoice,
      audioEncoding: 'WAV',
      mode: 'PUSH_TO_TALK',
    })], { type: 'application/json' }));
    const audioCopy = new Uint8Array(audio.byteLength);
    audio.copy(audioCopy);
    form.append('audio', new Blob([audioCopy], { type: 'audio/wav' }), 'recording.wav');
    const sessionId = randomUUID();
    const url = `${getMetaBaseUrl()}/asr/transcribe?sessionId=${encodeURIComponent(sessionId)}`;

    const response = await withMetaRetry(async () => {
      const result = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MODEL_API_KEY}`,
          Accept: 'application/json',
        },
        body: form,
        signal: AbortSignal.timeout(60_000),
      });
      if (!result.ok) {
        const error = new Error(safeMetaError({ status: result.status }));
        Object.assign(error, { status: result.status });
        throw error;
      }
      return result;
    });
    const result = await response.json() as VoiceResponse;
    const transcript = result.transcript || result.turns?.map((turn) => turn.transcript || '').join(' ').trim();
    if (!transcript) throw new Error('Muse Voice Transcribe returned no transcript.');
    return {
      value: { transcript, sessionId: result.sessionId || sessionId },
      requestId: result.sessionId || sessionId,
    };
  }, (value) => `Transcription completed (${value.transcript.length} characters).`);
}

export function voiceApiStatus() {
  return {
    enabled: isMetaConfigured(),
    model: META_MODELS.museVoice,
    status: isMetaConfigured() ? 'READY_TO_TEST' : 'CONFIGURATION_REQUIRED',
  };
}
