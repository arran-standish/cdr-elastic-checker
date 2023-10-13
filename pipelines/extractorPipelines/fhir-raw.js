import { client } from '../../elastic/connection.js';
import { pipelines } from '../pipeline.js';

async function processPipeline(pipeline) {
  let processCounter = 0;
  let result = await client.search({
    index: pipeline.rawIndex,
    from: 0,
    size: 10000,
    scroll: '120s',
    track_total_hits: true,
    body: {
      query: {
        match_all: {}
      }
    },
  });

  const totalHits = result.body.hits.total.value;

  do {
    if (result.body.hits.hits.length === 0) {
      console.log('finished pulling data');
      break;
    }

    for (const hit of result.body.hits.hits) {
      if (hit._source && hit._source.resource) {
        pipeline.runRaw(hit._source.resource);
      }

      processCounter++;
    }

    result = await client.scroll({
      scroll_id: result.body._scroll_id,
      scroll: '120s',
    });

  } while (totalHits !== processCounter);
}

export async function unitOfWork() {
  for (const pipeline of pipelines) {
    await processPipeline(pipeline);
    
    // needs to be in a place that makes sense
    pipeline.reduce();
  }
}