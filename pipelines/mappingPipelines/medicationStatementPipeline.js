const store = {};
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
    if (followUp.arvTreatmentStarted && Object.keys(followUp.arvTreatmentStarted).length !== 0) {
      if (store[patientId]) store[patientId] += 1;
      else store[patientId] = 1;
    }
    
    if (followUp.tbScreening && Object.keys(followUp.tbScreening).length !== 0) {
      if (store[patientId]) store[patientId] += 1;
      else store[patientId] = 1;
    }
    
    if (followUp.tbTreatment && Object.keys(followUp.tbTreatment).length !== 0) {
      if (store[patientId]) store[patientId] += 1;
      else store[patientId] = 1;
    }
    
    if (followUp.tbCotrimoxazolDrugs && Object.keys(followUp.tbCotrimoxazolDrugs).length !== 0) {
      if (store[patientId]) store[patientId] += 1;
      else store[patientId] = 1;
    }

    if (followUp.tbFluconazoleDrugs && Object.keys(followUp.tbFluconazoleDrugs).length !== 0) {
      if (store[patientId]) store[patientId] += 1;
      else store[patientId] = 1;
    }
  },
  rawIndex: 'fhir-raw-medicationstatement',
  runRaw: (data) => {
    const patientId = data.subject.reference.replace('Patient/', '');

    // if not a patient in the facility or not a actioned statement type continue
    if (!patients.has(patientId) || !isMatchingMedicationStatement(data)) return;

    if (store[patientId]) store[patientId] -= 1;
    else store[patientId] = -1;
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
    console.log(JSON.stringify(Object.keys(store).filter(key => store[key] < 0)));
  }
};