export async function createLocalPipeline(task, name, revision) {
  const { env, pipeline } = await import('@huggingface/transformers');
  env.allowLocalModels = false;
  // Embarko permits the WASM module URL and blocks cached blob scripts.
  env.useWasmCache = false;
  env.backends.onnx.wasm.numThreads = 1;
  return pipeline(task, name, { device: 'wasm', dtype: 'q8', revision });
}
