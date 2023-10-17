const store = new Map();
const patients = new Map();
const patientLatestHivCareplanId = new Map();

export default {
  run: (data, patientId) => {
    // we have found a careplan (hivPositiveTracking) so we need to increment on the patient id 
    if (data.hivPositiveTracking && !Object.isEmpty(data.hivPositiveTracking)) {
      store.setOrIncrementKey(patientId);
      patientLatestHivCareplanId.set(patientId, data.hivPositiveTracking.fhirID);
    }

    // store total amount of patients for facility -> to be moved to a patient pipeline instead
    // although need to figure out the pipeline depedency chain then
    // for now just put here
    patients.set(patientId, true);
  },
  runFollowUp: (followUp, patientId) => {
    // we have found a careplan (cervicalCancerCarePlan) so we need to increment on the patient id 
    if (followUp.cervicalScreening && !Object.isEmpty(followUp.cervicalScreening)) {
      store.setOrIncrementKey(patientId);
    }
  },
  rawIndex: 'fhir-raw-careplan',
  runRaw: (data) => {
    const patientId = data.subject.reference.replace('Patient/', '');
    const careplanType = data.category[0].coding[0].code;

    // if not a patient in the facility continue
    if (!patients.has(patientId)) return;
    
    // only update the count if we match with the current hiv careplan attached to the patient
    // since old ones are still in fhir-raw but have been overwritten in fhir-enrich
    if (careplanType === 'hiv-positive-tracking') {
      if (patientLatestHivCareplanId.get(patientId) === data.id) {
        store.setOrIncrementKey(patientId, -1);
      }
    } else {
      store.setOrIncrementKey(patientId, -1);
    }
  },
  reduce: () => {
    let positiveCareplans = 0;
    let negativeCareplans = 0;
    for (const difference of store.values()) {
      if (difference > 0) positiveCareplans += difference;
      if (difference < 0) negativeCareplans += difference;
    } 

    console.log(`a total of ${positiveCareplans} careplans are not deleted in fhir-enrich`);
    console.log(`a total of ${negativeCareplans} careplans are missing in fhir-enrich`);
  }
};