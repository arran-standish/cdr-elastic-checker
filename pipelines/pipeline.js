const pipelines = new Set();

export function registerPipeline(pipeline) {
  if (!pipeline || !pipeline.run) throw new Error('failed to register pipeline, could not find run function')
  if (typeof pipeline.run !== 'function') throw new Error(`failed to register pipeline expected run to be a function but got: ${typeof pipeline.run}`);

  pipelines.add(pipeline);
}

export function runPipelines(data) {
  for (const pipeline of pipelines) {
    pipeline.run(data);
  }
}

export function clearPipelines() {
  pipelines.clear();
}

export { pipelines };