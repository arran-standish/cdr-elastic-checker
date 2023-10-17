import { client } from './connection.js';

export async function executeQuery(index, query, unitOfWork) {
  let processCounter = 0;
  let result = await client.search({
    index: index,
    from: 0,
    size: 10000,
    scroll: '120s',
    track_total_hits: true,
    body: {
      query: query
    }
  });

  const totalHits = result.body.hits.total.value;

  do {
    if (result.body.hits.hits.length === 0) {
      console.log('finished pulling data');
      break;
    }

    for (const hit of result.body.hits.hits) {
      unitOfWork(hit);
      processCounter++;
    }

    result = await client.scroll({
      scroll_id: result.body._scroll_id,
      scroll: '120s',
    });

  } while (totalHits !== processCounter);
}