import { executeQuery } from '../../elastic/query.js';

export async function runRawPipelines(pipelines) {
  const query = { match_all: {} };
  
  for (const pipeline of pipelines) {
    await executeQuery(pipeline.rawIndex, query, (hit) => {
      if (hit._source && hit._source.resource) {
        pipeline.runRaw(hit._source.resource);
      }
    });
    
    pipeline.reduce();
    pipeline.clear();
  }
}