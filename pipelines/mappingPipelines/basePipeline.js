import { EventEmitter } from 'node:events';
const mappingPipelineEmitter = new EventEmitter();

export class BasePipeline {
  #mappingPipelineEmitter;
  #child;
  #resourceType;

  constructor(resourceType, child = null) {
    if (this.constructor == BasePipeline) {
      throw new Error('BasePipeline is an abstact class');
    }
    
    this.rawIndex = `fhir-raw-${resourceType}`;
    this.#resourceType = resourceType;
    this.#child = child;
    this.store = new Map();
    this.patients = new Map();
    this.#mappingPipelineEmitter = mappingPipelineEmitter;
    // after the patient pipeline finishes we update all other pipelines to have the same patients map
    // this needs to happen before fhir-raw runs
    mappingPipelineEmitter.on('patients', (patientsMap) => {
      this.patients = patientsMap;
    })
  }

  get mappingPipelineEmitter() {
    return this.#mappingPipelineEmitter;
  }

  get child() {
    return this.#child;
  }

  run(_data, _patientId) {
    return;
  }

  runFollowUp(_followUp, _patientId) {
    return;
  }

  runRaw() {
    if (this.patients.isEmpty())
      throw new Error('Patients map is empty, did the Patient pipeline run and emit its event?');
  }

  reduce() {
    let positive = 0;
    let negative = 0;
    for (const difference of this.store.values()) {
      if (difference > 0) positive += difference;
      if (difference < 0) negative += difference;
    } 

    console.log(`a total of ${positive} ${this.#resourceType} are not deleted in fhir-enrich`);
    console.log(`a total of ${negative} ${this.#resourceType} are missing in fhir-enrich`);
  }

  clear() {
    this.store.clear();
    // don't clear patients since this reference is shared across all pipelines
    // so clearing would clear it on still to be run pipelines
    // instead just clear the reference
    this.patients = null;
  }
}