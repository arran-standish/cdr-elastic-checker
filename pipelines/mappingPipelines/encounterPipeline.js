import { BasePipeline } from './basePipeline.js';

export class EncounterPipeline extends BasePipeline {
  constructor() {
    super('encounter');
  }

  runFollowUp(followUp, patientId) {
    if (
      Object.isKeyPopulated(followUp, 'followUpDate') || 
      Object.isKeyPopulated(followUp, 'nextVisitDate') || 
      Object.isKeyPopulated(followUp, 'visitType')
    ) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId) || data.type[0].coding[0].code !== "390906007") return;

    let isValidEncounter = false;
    if (Object.isKeyPopulated(data, 'extension')) {
      for (const extension of data.extension) {
        if (
          Object.isKeyPopulated(extension, 'valueDateTime') || 
          Object.isKeyPopulated(extension, 'valueString')
        ) isValidEncounter = true;
      }
    }
    if (Object.isKeyPopulated(data, 'period.start')) isValidEncounter = true;
    
    if (isValidEncounter) this.store.setOrIncrementKey(patientId, -1);
  }
}
