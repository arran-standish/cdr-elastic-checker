import { BasePipeline } from './basePipeline.js';

export class EncounterPipeline extends BasePipeline {
  constructor() {
    super('fhir-raw-encounter');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.followUpDate || followUp.nextVisitDate || followUp.visitType) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId) || data.type[0].coding[0].code !== "390906007") return;

    this.store.setOrIncrementKey(patientId, -1);
  }

  reduce() {
    super.reduce('encounters')
  }
}
