import { executeQuery } from '../../elastic/query.js';

const query = { match_all: {} };
const runner = async (pipeline) => {
  await executeQuery(pipeline.rawIndex, query, (hit) => {
    if (hit._source && hit._source.resource) {
      pipeline.runRaw(hit._source.resource);
    }
  });
  
  // move down the hierarchy to execute any children (lol)
  if (pipeline.child) 
    await runner(pipeline.child);

  pipeline.reduce();
  pipeline.clear();
}

export async function runRawPipelines(pipelines) {  
  for (const pipeline of pipelines) { 
    await runner(pipeline);
  }
}