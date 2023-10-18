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
  constructor() {
    super('fhir-raw-questionnaireresponse');
  }

  run(data, patientId) {
    if (data.indexCaseContactScreening && !Object.isEmpty(data.indexCaseContactScreening)) {
      this.store.setOrIncrementKey(patientId);
    }
    // note we ignore data.indexCaseContact here since the parent relatedPerson pipeline handles it
  }

  runFollowUp(followUp, patientId) {
    // ARTEligibility
    if (followUp.hivConfirmedDate || followUp.hivConfirmedDate) {
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
    } else {
      this.store.setOrIncrementKey(patientId, -1);
    }
  }

  reduce() {
    super.reduce('questionnaire responses');
  }
}