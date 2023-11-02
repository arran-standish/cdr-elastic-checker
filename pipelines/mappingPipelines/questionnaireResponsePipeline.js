import { BasePipeline } from './basePipeline.js';

function isMatchingQuestionnaire(data) {
  const questionnaireType = data.questionnaire;
  if (
    questionnaireType === "ARTEligibility" ||
    questionnaireType === "PregnancyStatus" ||
    questionnaireType === "AppointmentSpacingModel" ||
    questionnaireType === "IndexCaseContactScreening" ||
    questionnaireType === "IndexCaseFamilyContact"
  ) return true;

  return false;
}

export class QuestionnaireResponsePipeline extends BasePipeline {
  #contactScreenProcessed = new Map();
  constructor() {
    super('questionnaireresponse');
  }

  run(data, patientId) {
    if (data.indexCaseContactScreening && !Object.isEmpty(data.indexCaseContactScreening)) {
      this.store.setOrIncrementKey(patientId);
      // since the fhir-id is not stored can only check if we get at least 1 instance
      this.#contactScreenProcessed.set(patientId, true);
    }
    // note we ignore data.indexCaseContact here since the parent relatedPerson pipeline handles it
  }

  runFollowUp(followUp, patientId) {
    // ARTEligibility
    if (followUp.hivConfirmedDate || followUp.whyEligible || followUp.whyEligible === "") {
      this.store.setOrIncrementKey(patientId);
    }
    
    // PregnancyStatus
    if (followUp.pregnant || followUp.breastfeeding) {
      this.store.setOrIncrementKey(patientId);
    }
    
    // AppointmentSpacingModel
    if (followUp.asm && !Object.isEmpty(followUp.asm)) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId) || !isMatchingQuestionnaire(data)) return;

    if (data.questionnaire === 'IndexCaseFamilyContact') {
      const relatedPersonId = data.source.reference.replace('RelatedPerson/', '');
      this.mappingPipelineEmitter.emit('related-person', relatedPersonId, patientId);
    } else if (data.questionnaire === 'IndexCaseContactScreening' ) {
      if (this.#contactScreenProcessed.get(patientId)) {
        this.store.setOrIncrementKey(patientId, -1);
        // we have found at least 1 instance so stop tracking the others
        // since we only have 1 high level indexCaseContactScreening in fhir-enrich
        this.#contactScreenProcessed.set(patientId, false);
      }
    } else {
      this.store.setOrIncrementKey(patientId, -1);
    }
  }

  clear() {
    super.clear();
    this.#contactScreenProcessed.clear();
  }
}
