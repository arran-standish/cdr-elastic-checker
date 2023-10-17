import { BasePipeline } from "./basePipeline";

export class PatientPipeline extends BasePipeline {
  constructor() {
    // set high priority so patients pipeline always runs first
    super('fhir-raw-patient', 1);
  }

  run(_data, patientId) {
    this.store.setOrIncrementKey(patientId);
    this.patients.set(patientId, true);
  }

  runRaw(data) {
    // rework the pipeline runners so you can call PatientPipeline.emit before running the raw pipelines
    // since you don't need to have the patients list during the enrich process
    this.mappingPipelineEmitter.emit('patients', this.patients)

    const patientId = data.id;

    // not a patient in this facility
    if (!this.patients.has(patientId)) return;
    
    this.store.setOrIncrementKey(patientId, -1);
  }

  reduce() {
    super.reduce('patients');
  }
}