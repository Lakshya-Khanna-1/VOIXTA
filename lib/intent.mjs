import { createLocalPipeline } from './runtime.mjs';

const advice = 'The writer is giving advice about how to avoid being scammed.';
const request = 'The writer is asking the recipient to do something for them.';
let classifier;

export async function interpretReview(text, verdict) {
  classifier ??= createLocalPipeline(
    'zero-shot-classification',
    'Xenova/nli-deberta-v3-xsmall',
    '2a4f614a701367a02d51389039afc998faeda637',
  ).catch((error) => {
    classifier = undefined;
    throw error;
  });
  const analyze = await classifier;
  const { labels, scores } = await analyze(text, [advice, request], {
    multi_label: true,
    hypothesis_template: '{}',
  });
  const adviceScore = scores[labels.indexOf(advice)];
  const requestScore = scores[labels.indexOf(request)];
  if (adviceScore >= 0.91 && adviceScore - requestScore >= 0.055) {
    return { level: 'clear', evidence: [], context: 'advice' };
  }
  return verdict;
}
