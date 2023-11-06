import { BasePipeline } from './basePipeline.js';

export class MedicationDispensePipeline extends BasePipeline {
  constructor() {
    super('medicationdispense');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.followUpStatus || (followUp.arvDrugs && !Object.isEmpty(followUp.arvDrugs))) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId)) return;
    
    const hasValidExtension = data.extension && (
      (data.extension.valueDateTime && data.extension.valueDateTime !== '') ||
      (data.extension.valueBoolean && data.extension.valueDateTime !== '') ||
      (data.extension.valueString && data.extension.valueString !== '') 
    );
    if (
        hasValidExtension ||
        data.medicationCodeableConcept ||
        (data.statusReasonCodeableConcept && data.statusReasonCodeableConcept.coding[0].code) ||
        (data.quantity && data.quantity.value && data.quantity.value !== '') ||
        (data.daysSupply && data.daysSupply.value && data.daysSupply.value !== '')
      )
        this.store.setOrIncrementKey(patientId, -1);
  }
}
