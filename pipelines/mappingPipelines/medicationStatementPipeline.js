const store = new Map();
const patients = new Map();

function isMatchingMedicationStatement(data) {
  if (data.reasonCode && data.reasonCode[0].coding[0].code === 'arv-treatment') return true;
  if (
    data.category && (
      data.category.coding[0].code === '699618001' || 
      data.category.coding[0].code === 'tb-treatment'
    )
  ) return true;
  if (
    data.medicationCodeableConcept && (
      data.medicationCodeableConcept.coding[0].code === '398731002' ||
      data.medicationCodeableConcept.coding[0].code === '387174006'
    )
  ) return true;

  return false;
}

export default {
  run: (_data, patientId) => {
    patients.set(patientId, true);
  },
  runFollowUp: (followUp, patientId) => {
    if (followUp.arvTreatmentStarted && !Object.isEmpty(followUp.arvTreatmentStarted)) {
      store.setOrIncrementKey(patientId);
    }
    
    if (followUp.tbScreening && !Object.isEmpty(followUp.tbScreening)) {
      store.setOrIncrementKey(patientId);
    }
    
    if (followUp.tbTreatment && !Object.isEmpty(followUp.tbTreatment)) {
      store.setOrIncrementKey(patientId);
    }
    
    if (followUp.tbCotrimoxazolDrugs && !Object.isEmpty(followUp.tbCotrimoxazolDrugs)) {
      store.setOrIncrementKey(patientId);
    }

    if (followUp.tbFluconazoleDrugs && !Object.isEmpty(followUp.tbFluconazoleDrugs)) {
      store.setOrIncrementKey(patientId);
    }
  },
  rawIndex: 'fhir-raw-medicationstatement',
  runRaw: (data) => {
    const patientId = data.subject.reference.replace('Patient/', '');

    // if not a patient in the facility or not a actioned statement type continue
    if (!patients.has(patientId) || !isMatchingMedicationStatement(data)) return;

    store.setOrIncrementKey(patientId, -1);
  },
  reduce: () => {
    let positive = 0;
    let negative = 0;
    for (const difference of Object.values(store)) {
      if (difference > 0) positive += difference;
      if (difference < 0) negative += difference;
    }

    console.log(`a total of ${positive} medication statements are not deleted in fhir-enrich`);
    console.log(`a total of ${negative} medication statements are missing in fhir-enrich`);
  }
};