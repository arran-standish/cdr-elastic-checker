const store = {};
const patients = new Map();

export default {
  run: (data, patientId) => {
    patients.set(patientId, true);
  },
  runFollowUp: (followUp, patientId) => {
    // we have found a careplan (cervicalCancerCarePlan) so we need to increment on the patient id 
    // need to split out the run from run followups in future
    if (followUp.followUpStatus || (followUp.arvDrugs && Object.keys(followUp.arvDrugs).length !== 0)) {
      if (store[patientId]) store[patientId] += 1;
      else store[patientId] = 1;
    }
  },
  rawIndex: 'fhir-raw-medicationdispense',
  runRaw: (data) => {
    const patientId = data.subject.reference.replace('Patient/', '');

    // if not a patient in the facility continue
    if (!patients.has(patientId)) return;

    // not much logic here since all dispense should be in followups
    // so decrement if we match a followup to a dispense
    if (store[patientId]) store[patientId] -= 1;
    else store[patientId] = -1;
  },
  reduce: () => {
    let positiveDispense = 0;
    let negativeDispense = 0;
    for (const difference of Object.values(store)) {
      if (difference > 0) positiveDispense += difference;
      if (difference < 0) negativeDispense += difference;
    } 

    console.log(`a total of ${positiveDispense} medication dispenses are not deleted in fhir-enrich`);
    console.log(`a total of ${negativeDispense} medication dispenses are missing in fhir-enrich`);
  }
};