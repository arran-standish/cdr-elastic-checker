import { BasePipeline } from './basePipeline.js';

function isMatchingObservation(data) {
  if (!Object.isKeyPopulated(data, 'code.coding')) return false;

  const code = data.code.coding[0].code;
  const hasValueCodeableConcept = Object.isKeyPopulated(data, 'valueCodeableConcept.coding[0].code');
  const hasValueQuantity = Object.isKeyPopulated(data, 'valueQuantity.value');
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
    if (Object.isKeyPopulated(data, 'method.coding')) return true;
  }

  return false;
}

export class ObservationPipeline extends BasePipeline {
  constructor() {
    super('observation');
  }

  runFollowUp(followUp, patientId) {
    if (Object.isKeyPopulated(followUp, 'nutritionalStatus')) {
      this.store.setOrIncrementKey(patientId);
    }
    
    if (Object.isKeyPopulated(followUp, 'arvAdherence')) {
      this.store.setOrIncrementKey(patientId);
    }

    if (Object.isKeyPopulated(followUp, 'vitalSigns.weight')) {
      this.store.setOrIncrementKey(patientId);
    }

    if (Object.isKeyPopulated(followUp, 'labResults.viralLoad')) {
      this.store.setOrIncrementKey(patientId);
    }
    
    if (
      Object.isKeyPopulated(followUp, 'cervicalScreening.screeningMethod') ||
      Object.isKeyPopulated(followUp, 'cervicalScreening.hpvDNATestResult') ||
      Object.isKeyPopulated(followUp, 'cervicalScreening.viaScreeningResult')
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
