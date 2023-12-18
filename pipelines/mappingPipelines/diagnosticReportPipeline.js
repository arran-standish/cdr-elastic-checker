import { BasePipeline } from './basePipeline.js';

export class DiagnosticReportPipeline extends BasePipeline {
  constructor() {
    super('diagnosticreport');
  }

  runFollowUp(followUp, patientId) {
    if (
      Object.isKeyPopulated(followUp, 'labResults.viralLoadRequestedDate') ||
      Object.isKeyPopulated(followUp, 'labResults.viralLoadResultDate') ||
      Object.isKeyPopulated(followUp, 'labResults.viralLoadStatus')
    ) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');

    if (!this.patients.has(patientId) || data.code.coding[0].code !== '315124004') return;
    if (Object.isKeyPopulated(data, 'effectivePeriod') || Object.isKeyPopulated(data, 'conclusion'))
      this.store.setOrIncrementKey(patientId, -1);
  }
}
