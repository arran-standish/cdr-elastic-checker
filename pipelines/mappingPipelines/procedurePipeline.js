import { BasePipeline } from './basePipeline.js';

function isMatchingObservation(data) {
  if (!data.category || !data.code) return false;
  if (!data.category.coding || !data.code.coding) return false;

  const categoryCode = data.category.coding[0].code;
  const code = data.code.coding[0].code;

  // laboratoryProcedure type
  if (categoryCode === '108252007' && code === '315124004') {
    if (data.reasonCode && data.reasonCode[0].text && data.reasonCode[0].text !== '')
      return true;
    if (data.extension && data.extension[0].valueString && data.extension[0].valueString !== '')
      return true;

    // don't have either data fields to populate the object so ignore it
    return false;
  }

  // counsellingProcedure type
  if (categoryCode === '409063005') {
    if (code === 'eac') {
      if (data.performedDateTime && data.performedDateTime !== '') return true;
      if (data.status && data.status !== '') return true;
      if (data.extension && data.extension.valueString && data.extension.valueString !== '') return true;
    }

    if (code === 'cc-screening-counseled') {
      if (data.status && data.status !== '') return true;
      if (data.outcome && data.outcome.coding && data.outcome.coding[0].code !== '') return true;
    }
  }

  // screeningProcedure type
  if (categoryCode === '20135006' && code === '243877001') {
    if (data.status && data.status !== '') return true;
    if (data.performedDateTime && data.performedDateTime !== '') return true;
    if (data.extension && data.extension.valueString && data.extension.valueString !== '') return true;
  }

  return false;
}

export class ProcedurePipeline extends BasePipeline {
  constructor() {
    super('procedure');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.labResults) {
      const labResults = followUp.labResults;
      if (
        (labResults.viralLoadIndication && labResults.viralLoadIndication !== '') ||
        (labResults.viralLoadIndicationReason && labResults.viralLoadIndicationReason !== '')
      )
        this.store.setOrIncrementKey(patientId);
    }

    if (followUp.eac && !Object.isEmpty(followUp.eac)) {
      this.store.setOrIncrementKey(patientId);
    }

    if (followUp.cervicalScreening) {
      const cervicalScreening = followUp.cervicalScreening;
      // cervicalScreeningCounselling procedure fields
      if (cervicalScreening.counsellingGiven || cervicalScreening.acceptedScreening) {
        this.store.setOrIncrementKey(patientId);
      }

      // cervicalScreeningProcedure procedure fields
      if (cervicalScreening.screeningDone || cervicalScreening.dateScreeningDone || cervicalScreening.typeOfScreening) {
        this.store.setOrIncrementKey(patientId);
      }
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId) || !isMatchingObservation(data)) return;

    this.store.setOrIncrementKey(patientId, -1);
  }
}
