let transcriber;

export function loadTranscriber(onProgress) {
  transcriber ??= import('@huggingface/transformers').then(({ env, pipeline }) => {
    env.allowLocalModels = false;
    env.backends.onnx.wasm.numThreads = 1;
    return pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny', {
      device: 'wasm',
      dtype: 'q8',
      revision: 'ff4177021cc41f7db950912b73ea4fdf7d01d8e7',
      progress_callback: onProgress,
    });
  }).catch((error) => {
    transcriber = undefined;
    throw error;
  });
  return transcriber;
}

export async function decodeRecording(blob) {
  const Audio = window.AudioContext ?? window.webkitAudioContext;
  const OfflineAudio = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
  const context = new Audio();
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    const resampler = new OfflineAudio(1, Math.ceil(buffer.duration * 16000), 16000);
    const source = resampler.createBufferSource();
    source.buffer = buffer;
    source.connect(resampler.destination);
    source.start();
    return (await resampler.startRendering()).getChannelData(0);
  } finally {
    await context.close();
  }
}
