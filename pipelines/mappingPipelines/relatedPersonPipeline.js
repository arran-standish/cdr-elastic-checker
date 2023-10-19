import { BasePipeline } from './basePipeline.js';

export class RelatedPersonPipeline extends BasePipeline {
  #relatedPersonIds = new Map();
  #childEvent = (relatedPersonId, patientId) => {
    // we already handled this case when looping through all related persons so skip
    if (this.#relatedPersonIds.get(relatedPersonId)) return;

    // we have a person in the indexCaseContacts array but there originated elsewhere (questionnaire)
    // so we consider it a fhir-raw hit
    this.store.setOrIncrementKey(patientId, -1);
  }

  constructor(child) {
    if (!child) throw new Error('RelatedPersonPipeline depends on QuestionnaireResponsePipeline, did you pass in the child?');
    super('relatedperson', child);
    this.mappingPipelineEmitter.on('related-person', this.#childEvent);
  }

  run(data, patientId) {
    const relatedPersonsAmount = data.indexCaseContacts?.length ?? 0;
    this.store.setOrIncrementKey(patientId, relatedPersonsAmount);
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.patient.reference.replace('Patient/', '');
    
    if (!this.patients.has(patientId)) return;
    
    // remember which related persons have already been accounted for
    this.#relatedPersonIds.set(data.id, patientId);
    this.store.setOrIncrementKey(patientId, -1);
  }

  clear() {
    super.clear();
    this.#relatedPersonIds.clear();
    this.mappingPipelineEmitter.removeListener('related-person', this.#childEvent);
  }
}