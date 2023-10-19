import { BasePipeline } from './basePipeline.js';

export class DiagnosticReportPipeline extends BasePipeline {
  constructor() {
    super('fhir-raw-diagnosticreport');
  }

  runFollowUp(followUp, patientId) {
    if (followUp.labResults && (
        followUp.labResults.viralLoadRequestedDate || 
        followUp.labResults.viralLoadResultDate ||
        followUp.labResults.viralLoadStatus)
      ) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId) || data.code.coding[0].code !== '315124004') return;

    this.store.setOrIncrementKey(patientId, -1);
  }

  reduce() {
    super.reduce('diagnostic reports')
  }
}
