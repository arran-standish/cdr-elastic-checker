const store = new Map();
const patients = new Map();

export default {
  run: (_data, patientId) => {
    patients.set(patientId, true);
  },
  runFollowUp: (followUp, patientId) => {
    if (followUp.followUpStatus || (followUp.arvDrugs && !Object.isEmpty(followUp.arvDrugs))) {
      store.setOrIncrementKey(patientId);
    }
  },
  rawIndex: 'fhir-raw-medicationdispense',
  runRaw: (data) => {
    const patientId = data.subject.reference.replace('Patient/', '');

    // if not a patient in the facility continue
    if (!patients.has(patientId)) return;

    // not much logic here since all dispense should be in followups
    // so decrement if we match a followup to a dispense
    store.setOrIncrementKey(patientId, -1);
  },
  reduce: () => {
    let positiveDispense = 0;
    let negativeDispense = 0;
    for (const difference of store.values()) {
      if (difference > 0) positiveDispense += difference;
      if (difference < 0) negativeDispense += difference;
    }

    console.log(`a total of ${positiveDispense} medication dispenses are not deleted in fhir-enrich`);
    console.log(`a total of ${negativeDispense} medication dispenses are missing in fhir-enrich`);
  }
};