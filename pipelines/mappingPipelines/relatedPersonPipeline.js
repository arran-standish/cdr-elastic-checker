import { BasePipeline } from './basePipeline.js';

export class RelatedPersonPipeline extends BasePipeline {
  constructor() {
    super('fhir-raw-relatedperson');
  }

  run(data, patientId) {
    const relatedPersonsAmount = data.indexCaseContacts?.length ?? 0;
    this.store.setOrIncrementKey(patientId, relatedPersonsAmount);
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.patient.reference.replace('Patient/', '');
    
    if (!this.patients.has(patientId)) return;

    this.store.setOrIncrementKey(patientId, -1);
  }

  reduce() {
    super.reduce('related persons');
  }
}