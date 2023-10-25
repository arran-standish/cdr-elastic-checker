import { BasePipeline } from './basePipeline.js';

function isMatchingObservation(data) {
  if (!data.code || !data.code.coding) return false;

  const code = data.code.coding[0].code;
  if (
    code === '87276001' ||
    code === '418633004' ||
    code === '29463-7' ||
    code === '315124004' ||
    code === '54038-5'
  ) return true;

  return false;
}

export class ObservationPipeline extends BasePipeline {
  constructor() {
    super('observation');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.arvAdherence && followUp.nutritionalStatus !== '') {
      this.store.setOrIncrementKey(patientId);
    }
    
    if (followUp.arvAdherence && followUp.arvAdherence !== '') {
      this.store.setOrIncrementKey(patientId);
    }

    if (followUp.vitalSigns && followUp.vitalSigns.weight) {
      this.store.setOrIncrementKey(patientId);
    }

    if (followUp.labResults && followUp.labResults.viralLoad) {
      this.store.setOrIncrementKey(patientId);
    }
    
    if (followUp.cervicalScreening && (
      followUp.cervicalScreening.screeningMethod ||
      followUp.cervicalScreening.hpvDNATestResult ||
      followUp.cervicalScreening.viaScreeningResult)
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
}