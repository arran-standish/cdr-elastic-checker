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

    this.store.setOrIncrementKey(patientId, -1);
  }
}
