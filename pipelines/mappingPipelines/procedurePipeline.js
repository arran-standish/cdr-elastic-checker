import { BasePipeline } from './basePipeline.js';

function isMatchingObservation(data) {
  if (
    !Object.isKeyPopulated(data, 'category.coding') ||
    !Object.isKeyPopulated(data, 'code.coding')
  ) return false;

  const categoryCode = data.category.coding[0].code;
  const code = data.code.coding[0].code;

  // laboratoryProcedure type
  if (categoryCode === '108252007' && code === '315124004') {
    if (Object.isKeyPopulated(data, 'reasonCode[0].text')) return true;
    if (Object.isKeyPopulated(data, 'extension[0].valueString')) return true;

    // don't have either data fields to populate the object so ignore it
    return false;
  }

  // counsellingProcedure type
  if (categoryCode === '409063005') {
    if (code === 'eac') {
      if (Object.isKeyPopulated(data, 'performedDateTime')) return true;
      if (Object.isKeyPopulated(data, 'status')) return true;
      if (Object.isKeyPopulated(data, 'extension[0].valueString')) return true;
    }

    if (code === 'cc-screening-counseled') {
      if (Object.isKeyPopulated(data, 'status')) return true;
      if (Object.isKeyPopulated(data, 'outcome.coding[0].code')) return true;
    }
  }

  // screeningProcedure type
  if (categoryCode === '20135006' && code === '243877001') {
    if (Object.isKeyPopulated(data, 'status')) return true;
    if (Object.isKeyPopulated(data, 'performedDateTime')) return true;
    if (Object.isKeyPopulated(data, 'extension[0].valueString')) return true;
  }

  return false;
}

export class ProcedurePipeline extends BasePipeline {
  constructor() {
    super('procedure');
  }

  runFollowUp(followUp, patientId) {
    if (
      Object.isKeyPopulated(followUp, 'labResults.viralLoadIndication') ||
      Object.isKeyPopulated(followUp, 'labResults.viralLoadIndicationReason')
    ) {
      this.store.setOrIncrementKey(patientId);
    }

    if (Object.isKeyPopulated(followUp, 'eac')) {
      this.store.setOrIncrementKey(patientId);
    }

    // cervicalScreeningCounselling
    if (
      Object.isKeyPopulated(followUp, 'cervicalScreening.counsellingGiven') ||
      Object.isKeyPopulated(followUp, 'cervicalScreening.acceptedScreening')
    ) {
      this.store.setOrIncrementKey(patientId);
    }

    // cervicalScreeningProcedure
    if (
      Object.isKeyPopulated(followUp, 'cervicalScreening.screeningDone') ||
      Object.isKeyPopulated(followUp, 'cervicalScreening.dateScreeningDone') ||
      Object.isKeyPopulated(followUp, 'cervicalScreening.typeOfScreening')
    )
    this.store.setOrIncrementKey(patientId);
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId) || !isMatchingObservation(data)) return;

    this.store.setOrIncrementKey(patientId, -1);
  }
}
