import { EventEmitter } from 'node:events';
const mappingPipelineEmitter = new EventEmitter();

export class BasePipeline {
  #mappingPipelineEmitter;

  constructor(rawIndex, priority = 999) {
    if (this.constructor == BasePipeline) {
      throw new Error('BasePipeline is an abstact class');
    }
    
    this.rawIndex = rawIndex;
    this.priority = priority;
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

  run(_data, _patientId) {
    return;
  }

  runFollowUp(_followUp, _patientId) {
    return;
  }

  runRaw() {
    throw new Error("Method 'runRaw()' must be implemented");
  }

  reduce(resource = '') {
    let positive = 0;
    let negative = 0;
    for (const difference of this.store.values()) {
      if (difference > 0) positive += difference;
      if (difference < 0) negative += difference;
    } 

    console.log(`a total of ${positive} ${resource} are not deleted in fhir-enrich`);
    console.log(`a total of ${negative} ${resource} are missing in fhir-enrich`);
  }
}