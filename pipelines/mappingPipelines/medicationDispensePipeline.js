import { BasePipeline } from "./basePipeline";

export class MedicationDispensePipeline extends BasePipeline {
  constructor() {
    super('fhir-raw-medicationdispense');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.followUpStatus || (followUp.arvDrugs && !Object.isEmpty(followUp.arvDrugs))) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId)) return;

    this.store.setOrIncrementKey(patientId, -1);
  }

  reduce() {
    super.reduce('medication dispenses')
  }
}
