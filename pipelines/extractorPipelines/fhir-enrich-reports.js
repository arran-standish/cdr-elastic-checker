import { executeQuery } from '../../elastic/query.js';
import { pipelines } from '../pipeline.js';

export async function runEnrichPipelines(healthFacilityId) {
  const query = healthFacilityId 
    ? { term: { "facility.HFUID": healthFacilityId } } 
    : { match_all: {} };

  // ... O(N^3) although pipelines should be fairly small so more like O(N^2)
  // Alternative is to loop through followups multiple times which probably increases time due to data nature
  await executeQuery('fhir-enrich-reports', query, (hit) => {
    const data = hit._source;
    // should probably fix the underlying data instead
    if (!data.patient) return;

    for (const pipeline of pipelines) {
      const patientId = data.patient.fhirID;
      pipeline.run(data, patientId)

      if (data.followUps && data.followUps.length > 0) {
        for (const followup of hit._source.followUps) {
          pipeline.runFollowUp(followup, patientId);
        }
      }
    }
  });
}