import { BasePipeline } from './basePipeline.js';

export class MedicationDispensePipeline extends BasePipeline {
  constructor() {
    super('medicationdispense');
  }

  runFollowUp(followUp, patientId) {
    if (
      Object.isKeyPopulated(followUp, 'followUpStatus') ||
      Object.isKeyPopulated(followUp, 'arvDrugs')) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId)) return;

    const hasValidExtension = 
      Object.isKeyPopulated(data, 'extension.valueDateTime') ||
      Object.isKeyPopulated(data, 'extension.valueBoolean') ||
      Object.isKeyPopulated(data, 'extension.valueString');

    if (
      hasValidExtension ||
      Object.isKeyPopulated(data, 'medicationCodeableConcept') ||
      Object.isKeyPopulated(data, 'statusReasonCodeableConcept.coding[0].code') ||
      Object.isKeyPopulated(data, 'quantity.value') ||
      Object.isKeyPopulated(data, 'daysSupply.value')
    )
      this.store.setOrIncrementKey(patientId, -1);
  }
}
