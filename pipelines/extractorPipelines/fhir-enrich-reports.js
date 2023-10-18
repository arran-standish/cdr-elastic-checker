import { executeQuery } from '../../elastic/query.js';

export async function runEnrichPipelines(healthFacilityId, pipelines) {
  const query = healthFacilityId 
    ? { term: { "facility.HFUID": healthFacilityId } } 
    : { match_all: {} };

  const mainRunner = (pipeline, data, patientId) => {
    pipeline.run(data, patientId);
    if (pipeline.child)
      mainRunner(pipeline.child, data, patientId);
  }

  const followUpRunner = (pipeline, followup, patientId) => {
    pipeline.runFollowUp(followup, patientId);
    if (pipeline.child)
      followUpRunner(pipeline.child, followup, patientId);
  }
  
  // ... O(N^3) although pipelines should be fairly small so more like O(N^2)
  // Alternative is to loop through followups multiple times which probably increases time due to data nature
  await executeQuery('fhir-enrich-reports', query, (hit) => {
    const data = hit._source;
    // should probably fix the underlying data instead
    if (!data.patient) return;

    for (const pipeline of pipelines) {
      const patientId = data.patient.fhirID;

      mainRunner(pipeline, data, patientId);

      if (data.followUps && data.followUps.length > 0) {
        for (const followup of data.followUps) {
          followUpRunner(pipeline, followup, patientId)
        }
      }
    }
  });
}