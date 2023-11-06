import { BasePipeline } from './basePipeline.js';

function isMatchingMedicationStatement(data) {
  const hasEffectivePeriod =
    Object.isKeyPopulated(data, 'effectivePeriod.start') ||
    Object.isKeyPopulated(data, 'effectivePeriod.end');

  if (data.reasonCode && data.reasonCode[0].coding[0].code === 'arv-treatment') {
    if (hasEffectivePeriod || Object.isKeyPopulated(data, 'status')) return true;
  }

  if (data.category && data.category.coding[0].code === '699618001') {
    if (hasEffectivePeriod || Object.isKeyPopulated(data, 'reasonCode[0]')) return true;
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
    if (Object.isKeyPopulated(followUp, 'arvTreatmentStarted')) {
      this.store.setOrIncrementKey(patientId);
    }

    if (Object.isKeyPopulated(followUp, 'tbScreening')) {
      this.store.setOrIncrementKey(patientId);
    }

    if (Object.isKeyPopulated(followUp, 'tbTreatment')) {
      this.store.setOrIncrementKey(patientId);
    }

    if (Object.isKeyPopulated(followUp, 'tbCotrimoxazolDrugs')) {
      this.store.setOrIncrementKey(patientId);
    }

    if (Object.isKeyPopulated(followUp, 'tbFluconazoleDrugs')) {
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
