const store = new Map();
const patients = new Map();

export default {
  run: (_data, patientId) => {
    store.setOrIncrementKey(patientId);
    patients.set(patientId, true);
  },
  runFollowUp: (_followUp, _patientId) => { return; },
  rawIndex: 'fhir-raw-patient',
  runRaw: (data) => {
    const patientId = data.id;

    // not a patient in this facility
    if (!patients.has(patientId)) return;
    
    store.setOrIncrementKey(patientId, -1);
  },
  reduce: () => {
    let positiveCareplans = 0;
    let negativeCareplans = 0;
    for (const difference of store.values()) {
      if (difference > 0) positiveCareplans += difference;
      if (difference < 0) negativeCareplans += difference;
    } 

    console.log(`a total of ${positiveCareplans} patients are not deleted in fhir-enrich`);
    console.log(`a total of ${negativeCareplans} patients are missing in fhir-enrich`);
  }
};