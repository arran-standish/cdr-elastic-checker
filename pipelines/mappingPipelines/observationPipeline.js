import { BasePipeline } from './basePipeline.js';

function isMatchingObservation(data) {
  if (!data.code || !data.code.coding) return false;

  const code = data.code.coding[0].code;
  const hasValueCodeableConcept = data.valueCodeableConcept && data.valueCodeableConcept.coding[0].code;
  const hasValueQuantity = data.valueQuantity && data.valueQuantity.value && data.valueQuantity.value !== '';
  // nutritionalStatus
  if (hasValueCodeableConcept && code === '87276001') return true;

  // medicationAdherence
  if (hasValueCodeableConcept && code === '418633004') return true;

  // weight
  if (hasValueQuantity && code === '29463-7') return true;

  // viralLoad
  if (hasValueQuantity && code === '315124004') return true;

  // only count cervicalCancerScreening if we have fields to populate the object with
  if (code === '54038-5') {
    if (hasValueCodeableConcept) return true;
    if (data.method && data.method.coding) return true;
  }

  return false;
}

export class ObservationPipeline extends BasePipeline {
  constructor() {
    super('observation');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.nutritionalStatus && followUp.nutritionalStatus !== '') {
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
