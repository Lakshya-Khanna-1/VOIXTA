const models = {
  en: ['onnx-community/whisper-tiny', 'ff4177021cc41f7db950912b73ea4fdf7d01d8e7'],
  hi: ['MaybeSomeone19/whisper-tiny-hinglish-onnx', '3a5b29845725c773eed1f7e04f4dcf69bddc79c4'],
};

const transcribers = {};

export function loadTranscriber(language) {
  const [name, revision] = models[language];
  transcribers[language] ??= import('@huggingface/transformers').then(({ env, pipeline }) => {
    env.allowLocalModels = false;
    // Embarko allows the WASM module URL and blocks cached blob scripts.
    env.useWasmCache = false;
    env.backends.onnx.wasm.numThreads = 1;
    return pipeline('automatic-speech-recognition', name, {
      device: 'wasm',
      dtype: 'q8',
      revision,
    });
  }).catch((error) => {
    delete transcribers[language];
    throw error;
  });
  return transcribers[language];
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
