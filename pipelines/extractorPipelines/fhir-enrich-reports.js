import { client } from '../../elastic/connection.js';
import { runPipelines } from '../index.js';
import { pipelines } from '../pipeline.js';


export async function unitOfWork(healthFacilityId) {
  let processCounter = 0;

  // xQcwHlb5f7a for QA
  // patient id with 2 medication dispenses
  // 84ba4876-9a2b-48b4-8ca3-b3ef2a8a9265
  // "patient.fhirID": "84ba4876-9a2b-48b4-8ca3-b3ef2a8a9265"
  let result = await client.search({
    index: 'fhir-enrich-reports',
    from: 0,
    size: 10000,
    scroll: '120s',
    track_total_hits: true,
    body: {
      query: {
        ...(healthFacilityId ? {
          term: {
            "facility.HFUID": healthFacilityId
          }
        } : {
          match_all: {}
        })
      }
    },
  });

  const totalHits = result.body.hits.total.value;

  do {
    if (result.body.hits.hits.length === 0) {
      console.log('finished pulling data');
      break;
    }

    // ... O(N^3) although pipelines should be fairly small so more like O(N^2)
    // Alternative is to loop through followups multiple times which probably increases time due to data nature
    for (const hit of result.body.hits.hits) {
      const data = hit._source;
      // should probably fix the underlying data instead
      if (!data.patient) continue;
     
      for (const pipeline of pipelines) {
        const patientId = data.patient.fhirID;
        pipeline.run(data, patientId)

        if (hit._source.followUps && hit._source.followUps.length > 0) {
          for (const followup of hit._source.followUps) {
            pipeline.runFollowUp(followup, patientId);
          }
        }
      }

      processCounter++;
    }

    result = await client.scroll({
      scroll_id: result.body._scroll_id,
      scroll: '120s',
    });

  } while (totalHits !== processCounter);
}