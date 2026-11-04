import { decodeMaskToRaster, decodeMaskToSVGPath, parseImageStream, recordsOfKind } from '@meta-sam/parser';
import { imageSize } from 'image-size';
import type { SamDetection } from '../../../../src/types/index.js';
import { getMetaApiClient, META_MODELS, runMetaOperation, withMetaRetry } from './metaClient.js';

const COLORS = ['#22C58B', '#7C8CFF', '#A78BFA', '#F5B942', '#62DCEB'];

export interface SegmentationResult {
  detections: SamDetection[];
  requestId?: string;
  imageWidth: number;
  imageHeight: number;
}

export async function parseSamStream(
  events: AsyncIterable<{ readonly type: string }>,
  imageWidth: number,
  imageHeight: number,
  prompt: string,
  reference: string,
): Promise<Omit<SegmentationResult, 'requestId'>> {
  const parsed = await parseImageStream(events).finalResult;
  if (parsed.outcome.status !== 'completed') throw new Error('SAM segmentation response did not complete.');

  const boxes = recordsOfKind(parsed.records, 'box');
  const masks = recordsOfKind(parsed.records, 'mask');
  const detections = boxes.map((box, index): SamDetection => {
    const maskRecord = masks.find((mask) => mask.objectId === box.objectId);
    const raster = maskRecord ? decodeMaskToRaster(maskRecord.mask) : undefined;
    if (maskRecord && raster?.length !== maskRecord.mask.width * maskRecord.mask.height) {
      throw new Error('SAM returned a mask with invalid dimensions.');
    }
    const left = Math.max(0, Math.min(100, (box.left / imageWidth) * 100));
    const top = Math.max(0, Math.min(100, (box.top / imageHeight) * 100));
    const right = Math.max(left, Math.min(100, (box.right / imageWidth) * 100));
    const bottom = Math.max(top, Math.min(100, (box.bottom / imageHeight) * 100));
    return {
      id: `${reference}:${box.objectId}`,
      label: prompt,
      confidence: box.confidence,
      bbox: [left, top, right - left, bottom - top],
      color: COLORS[index % COLORS.length],
      attributes: { objectId: box.objectId },
      ...(maskRecord ? {
        mask: {
          path: decodeMaskToSVGPath(maskRecord.mask),
          width: maskRecord.mask.width,
          height: maskRecord.mask.height,
          bounds: maskRecord.bounds,
        },
      } : {}),
    };
  });
  return { detections, imageWidth, imageHeight };
}

export async function segmentImage(
  bytes: Buffer,
  mimeType: string,
  prompt: string,
  reference: string,
): Promise<SegmentationResult> {
  if (!mimeType.startsWith('image/')) throw new Error('SAM segmentation requires an image file.');
  const dimensions = imageSize(bytes);
  if (!dimensions.width || !dimensions.height) throw new Error('Could not read the uploaded image dimensions.');
  return runMetaOperation('SAM 3.1', META_MODELS.sam, 'image_segmentation', [reference], async () => {
    const imageUrl = `data:${mimeType};base64,${bytes.toString('base64')}`;
    const client = getMetaApiClient();
    const events = await withMetaRetry(() => client.responses.create({
      model: META_MODELS.sam,
      input: [{
        type: 'message',
        role: 'user',
        content: [
          { type: 'input_text', text: prompt },
          { type: 'input_image', image_url: imageUrl, detail: 'high' },
        ],
      }],
      stream: true as const,
      metadata: { mask_encoding: 'one_bit' },
    }));
    let usage: Record<string, number> | undefined;
    async function* captureUsage() {
      for await (const event of events) {
        if (event.type === 'response.completed' && event.response.usage) {
          usage = {
            inputTokens: event.response.usage.input_tokens,
            outputTokens: event.response.usage.output_tokens,
            totalTokens: event.response.usage.total_tokens,
          };
        }
        yield event;
      }
    }
    const result = await parseSamStream(captureUsage(), dimensions.width, dimensions.height, prompt, reference);
    const requestId = events._request_id || undefined;
    return {
      value: { ...result, requestId },
      requestId,
      usage,
    };
  }, (value) => `${value.detections.length} ${prompt} segment(s) returned by SAM.`);
}

export async function testSamConnection(bytes: Buffer): Promise<SegmentationResult> {
  return segmentImage(bytes, 'image/jpeg', 'chair', 'connection-test-image');
}

export function promptsForTask(title: string, description = ''): string[] {
  const source = `${title} ${description}`.toLowerCase();
  const candidates: Array<[RegExp, string]> = [
    [/\b(chairs?|seats?)\b/, 'chair'],
    [/\b(projector|projectors)\b/, 'projector'],
    [/\b(registration desk|check-in desk|check in desk)\b/, 'registration desk'],
    [/\b(directional sign|signage|wayfinding sign)\b/, 'directional sign'],
    [/\b(emergency exit|fire exit|exit door)\b/, 'emergency exit'],
  ];
  const prompts = candidates.filter(([pattern]) => pattern.test(source)).map(([, prompt]) => prompt);
  if (prompts.length) return [...new Set(prompts)];
  const nounPhrase = title
    .replace(/^(arrange|prepare|install|ensure|set up|create|complete|verify)\s+/i, '')
    .replace(/\b\d+\b/g, '')
    .trim();
  return [nounPhrase || 'work area'];
}
