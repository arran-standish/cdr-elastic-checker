import { BasePipeline } from './basePipeline.js';

function isMatchingObservation(data) {
  if (!data.code || !data.code.coding) return false;

  const code = data.code.coding[0].code;
  if (
    code === '87276001' ||
    code === '418633004' ||
    code === '29463-7'
  ) return true;

  // only count a labResult observation if it has data to add to the object
  // since we can't count on the root object itself because other pipelines add data to it
  if (code === '315124004' && data.valueQuantity && data.valueQuantity.value)
    return true;

  // only count cervicalCancerScreening if we have fields to populate the object with
  if (code === '54038-5') {
    if (data.method && data.method.coding) return true;
    if (data.valueCodeableConcept && data.valueCodeableConcept.coding) return true;
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
