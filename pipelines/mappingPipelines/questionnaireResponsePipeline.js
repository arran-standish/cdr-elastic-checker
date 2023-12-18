import { BasePipeline } from './basePipeline.js';

export class QuestionnaireResponsePipeline extends BasePipeline {
  #contactScreenProcessed = new Map();
  constructor() {
    super('questionnaireresponse');
  }

  run(data, patientId) {
    if (Object.isKeyPopulated(data, 'indexCaseContactScreening')) {
      this.store.setOrIncrementKey(patientId);
      // since the fhir-id is not stored can only check if we get at least 1 instance
      this.#contactScreenProcessed.set(patientId, true);
    }
    // note we ignore data.indexCaseContact here since the parent relatedPerson pipeline handles it
  }

  runFollowUp(followUp, patientId) {
    // ARTEligibility
    if (
      Object.isKeyPopulated(followUp, 'hivConfirmedDate') || 
      Object.isKeyPopulated(followUp, 'whyEligible')
    ) {
      this.store.setOrIncrementKey(patientId);
    }
    
    // PregnancyStatus
    if (
      Object.isKeyPopulated(followUp, 'pregnant') || 
      Object.isKeyPopulated(followUp, 'breastfeeding')
    ) {
      this.store.setOrIncrementKey(patientId);
    }
    
    // AppointmentSpacingModel
    if (Object.isKeyPopulated(followUp, 'asm')) {
      // we can have an asm object but every value in that object is null
      // this happens when the raw questionnaire responses have no identifiable values
      // so ignore it since we would ignore it during the raw loop
      if (Object.values(followUp.asm).some((value) => value !== null && typeof value !== 'undefined' && value !== '')) {
        this.store.setOrIncrementKey(patientId);
      }
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId)) return;

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
      if (!Object.isKeyPopulated(data, 'item')) return;
      
      if (data.questionnaire === 'ARTEligibility') {
        let validART = false;
        for (const item of data.item) {
          if (item.linkId === 'hiv-confirmation-date') {
            if (Object.isKeyPopulated(item, 'answer[0].valueDate')) {
              validART = true;
              break;
            }
          }
          if (item.linkId === 'eligbility') {
            // item[0] => eligbility.eligbile
            // item[0].answer[0].item[0] => eligbility.eligbile.why
            if (Object.isKeyPopulated(item, 'item[0].answer[0].item[0].answer[0].valueString')) {
              validART = true;
              break;
            }
          }
        }
        if (validART) this.store.setOrIncrementKey(patientId, -1);
      } else if (data.questionnaire === 'PregnancyStatus') {
        for (const item of data.item) {
          if (item.linkId === 'pregnant' || item.linkId === 'is-breast-feeding') {
            if (Object.isKeyPopulated(item, 'answer[0].valueBoolean')) {
              this.store.setOrIncrementKey(patientId, -1);
              break;
            }
          }
        }
      } else if (data.questionnaire === 'AppointmentSpacingModel') {
        let validASM = false;
        for (const item of data.item) {
          if (item.linkId === 'assessment') {
            for (const innerItem of item.item) {
              if (
                Object.isKeyPopulated(innerItem, 'answer[0].valueDate') ||
                Object.isKeyPopulated(innerItem, 'answer[0].valueBoolean')
              ) {
                validASM = true;
                break;
              }
            }
          }
          if (item.linkId === 'new-category-change') {
            for (const innerItem of item.item) {
              if (
                Object.isKeyPopulated(innerItem, 'answer[0].valueDate') ||
                Object.isKeyPopulated(innerItem, 'answer[0].valueString')
              ) {
                validASM = true;
                break;
              }
            }
          }
          if (item.linkId === 'enrollment' || item.linkId === 'termination') {
            for (const innerItem of item.item) {
              if (
                Object.isKeyPopulated(innerItem, 'answer[0].valueDate') ||
                Object.isKeyPopulated(innerItem, 'answer[0].valueBoolean') ||
                Object.isKeyPopulated(innerItem, 'answer[0].valueString')
              ) {
                validASM = true;
                break;
              }
            }
          }
          if (item.linkId === 'couple-enrollment') {
            for (const innerItem of item.item) {
              if (
                Object.isKeyPopulated(innerItem, 'answer[0].valueBoolean') ||
                Object.isKeyPopulated(innerItem, 'answer[0].valueString')
              ) {
                validASM = true;
                break;
              }
            }
          }
          if (item.linkId === 'category') {
            if (Object.isKeyPopulated(item, 'answer[0].valueString')) validASM = true;
          }
          if (item.linkId === 'eligible' || item.linkId === 'counseled') {
            if (Object.isKeyPopulated(item, 'answer[0].valueBoolean')) validASM = true;
          }
        }
        if (validASM) this.store.setOrIncrementKey(patientId, -1);
      }
    }

  }

  clear() {
    super.clear();
    this.#contactScreenProcessed.clear();
  }
}
