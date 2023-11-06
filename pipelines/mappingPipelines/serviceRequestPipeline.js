import { BasePipeline } from './basePipeline.js';

export class ServiceRequestPipeline extends BasePipeline {
  #careplanEventHandler = (patientId, careplanId) => {
    this.patientLatestHivCareplanId.set(patientId, careplanId);
  }

  constructor() {
    super('servicerequest');
    this.patientLatestHivCareplanId = new Map();
    this.mappingPipelineEmitter.on('hiv-careplan', this.#careplanEventHandler);
  }

  run(data, patientId) {
    if (Object.isKeyPopulated(data, 'hivPositiveTracking.entryPoint')) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();    
    const patientId = data.subject.reference.replace('Patient/', '');
    if (!this.patients.has(patientId)) return;

    const basedOnCarePlan = data.basedOn[0].reference.replace('CarePlan/', '');
    const careplanId = this.patientLatestHivCareplanId.get(patientId);
    // we have not found a careplan for this patient but we do have a service request
    // so mark it is a hit in fhir-raw
    if (!careplanId) this.store.setOrIncrementKey(patientId, -1);

    // we only want to consider a hit if it is for the current active hiv careplan
    // since the older service requests are still in fhir-raw but should not be counted
    if (careplanId === basedOnCarePlan) this.store.setOrIncrementKey(patientId, -1);
  }

  clear() {
    super.clear()
    this.patientLatestHivCareplanId.clear();
    this.mappingPipelineEmitter.removeListener('hiv-careplan', this.#careplanEventHandler);
  }
}