import { BasePipeline } from './basePipeline.js';

function isMatchingMedicationStatement(data) {
  const hasEffectivePeriod = data.effectivePeriod && (
    (data.effectivePeriod.start && data.effectivePeriod.start !== '') || 
    (data.effectivePeriod.end && data.effectivePeriod.end !== '')
  );

  if (data.reasonCode && data.reasonCode[0].coding[0].code === 'arv-treatment') {
    if (hasEffectivePeriod || data.status) return true;
  } 

  if (data.category && data.category.coding[0].code === '699618001') {
    if (hasEffectivePeriod || data.reasonCode && data.reasonCode[0]) return true;
  }

  if (hasEffectivePeriod && data.category && data.category.coding[0].code === 'tb-treatment') return true;
  if (
    hasEffectivePeriod &&
    data.medicationCodeableConcept && (
      data.medicationCodeableConcept.coding[0].code === '398731002' ||
      data.medicationCodeableConcept.coding[0].code === '387174006'
    )
  ) return true;

  return false;
}

export class MedicationStatementPipeline extends BasePipeline {
  constructor() {
    super('medicationstatement');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.arvTreatmentStarted && !Object.isEmpty(followUp.arvTreatmentStarted)) {
      this.store.setOrIncrementKey(patientId);
    }
    
    if (followUp.tbScreening && !Object.isEmpty(followUp.tbScreening)) {
      this.store.setOrIncrementKey(patientId);
    }
    
    if (followUp.tbTreatment && !Object.isEmpty(followUp.tbTreatment)) {
      this.store.setOrIncrementKey(patientId);
    }
    
    if (followUp.tbCotrimoxazolDrugs && !Object.isEmpty(followUp.tbCotrimoxazolDrugs)) {
      this.store.setOrIncrementKey(patientId);
    }

    if (followUp.tbFluconazoleDrugs && !Object.isEmpty(followUp.tbFluconazoleDrugs)) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    // if not a patient in the facility or not a actioned statement type continue
    if (!this.patients.has(patientId) || !isMatchingMedicationStatement(data)) return;

    this.store.setOrIncrementKey(patientId, -1);
  }
}
