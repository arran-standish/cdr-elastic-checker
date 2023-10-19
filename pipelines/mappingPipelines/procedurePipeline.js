import { BasePipeline } from './basePipeline.js';

function isMatchingObservation(data) {
  const categoryCode = data.category.coding[0].code;
  const code = data.code.coding[0].code;

  // laboratoryProcedure type
  if (categoryCode === '108252007' && code === '315124004')
    return true;

  // counsellingProcedure type
  if (
    categoryCode === '409063005' && (
      code === 'eac' ||
      code === 'cc-screening-counseled'
    )
  ) return true;

  // screeningProcedure type
  if (categoryCode === '20135006' && code === '243877001')
    return true;

  return false;
}

export class ProcedurePipeline extends BasePipeline {
  constructor() {
    super('fhir-raw-procedure');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.labResults && (
      followUp.labResults.viralLoadIndication ||
      followUp.labResults.viralLoadIndicationReason)
    ) {
      this.store.setOrIncrementKey(patientId);
    }

    if (followUp.eac && !Object.isEmpty(followUp.eac)) {
      this.store.setOrIncrementKey(patientId);
    }

    if (followUp.cervicalScreening && (
      followUp.cervicalScreening.counsellingGiven ||
      followUp.cervicalScreening.acceptedScreening ||
      followUp.cervicalScreening.screeningDone ||
      followUp.cervicalScreening.dateScreeningDone ||
      followUp.cervicalScreening.typeOfScreening)
    ) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId) || !isMatchingObservation(data)) return;

    this.store.setOrIncrementKey(patientId, -1);
  }

  reduce() {
    super.reduce('procedures');
  }
}