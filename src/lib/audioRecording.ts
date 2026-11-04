export interface WavRecording {
  stop: () => Promise<Blob>;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
  };
  writeText(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

export async function startWavRecording(): Promise<WavRecording> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone recording is not available in this browser.');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];

  processor.onaudioprocess = (event) => {
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    event.outputBuffer.getChannelData(0).fill(0);
  };
  source.connect(processor);
  processor.connect(audioContext.destination);
  await audioContext.resume();

  return {
    stop: async () => {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      await audioContext.close();

      const sourceLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
      const sourceSamples = new Float32Array(sourceLength);
      let offset = 0;
      for (const chunk of chunks) {
        sourceSamples.set(chunk, offset);
        offset += chunk.length;
      }

      const outputRate = 24_000;
      const outputLength = Math.floor(sourceSamples.length * outputRate / audioContext.sampleRate);
      const resampled = new Float32Array(outputLength);
      for (let index = 0; index < outputLength; index += 1) {
        const sourceIndex = index * audioContext.sampleRate / outputRate;
        const lower = Math.floor(sourceIndex);
        const upper = Math.min(lower + 1, sourceSamples.length - 1);
        const ratio = sourceIndex - lower;
        resampled[index] = sourceSamples[lower] * (1 - ratio) + sourceSamples[upper] * ratio;
      }
      return encodeWav(resampled, outputRate);
    },
  };
}
