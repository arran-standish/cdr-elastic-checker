import { BasePipeline } from './basePipeline.js';

export class PatientPipeline extends BasePipeline {
  constructor() {
    super('fhir-raw-patient');
  }

  run(_data, patientId) {
    this.store.setOrIncrementKey(patientId);
    this.patients.set(patientId, true);
  }

  runRaw(data) {
    const patientId = data.id;

    // not a patient in this facility
    if (!this.patients.has(patientId)) return;
    
    this.store.setOrIncrementKey(patientId, -1);
  }

  emitPatientStore() {
    this.mappingPipelineEmitter.emit('patients', this.patients);
  }

  reduce() {
    super.reduce('patients');
  }
}