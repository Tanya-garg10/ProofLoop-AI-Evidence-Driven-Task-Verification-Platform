import { getMetaApiClient, META_MODELS, runMetaOperation, withMetaRetry } from './metaClient.js';

export async function generateIllustration(prompt: string): Promise<{ image: string; revisedPrompt?: string }> {
  return runMetaOperation('Muse Image', META_MODELS.museImage, 'illustration_generation', [], async () => {
    const response = await withMetaRetry(() => getMetaApiClient().images.generate({
      model: META_MODELS.museImage,
      prompt: `${prompt}\nThis is illustrative artwork, not photographic evidence of a real-world task.`,
      size: '1024x1024',
    }));
    const image = response.data?.[0]?.b64_json;
    if (!image) throw new Error('Muse Image returned no generated image.');
    return {
      value: { image, revisedPrompt: response.data?.[0]?.revised_prompt || undefined },
      requestId: response._request_id || undefined,
    };
  }, () => 'Illustration generated; not valid as evidence.');
}
