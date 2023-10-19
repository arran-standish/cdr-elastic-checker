import { BasePipeline } from './basePipeline.js';

export class CareplanPipeline extends BasePipeline {
  constructor() {
    super('careplan');
    this.patientLatestHivCareplanId = new Map();
  }

  run(data, patientId) {
    // we have found a careplan (hivPositiveTracking) so we need to increment on the patient id 
    if (data.hivPositiveTracking && !Object.isEmpty(data.hivPositiveTracking)) {
      this.store.setOrIncrementKey(patientId);
      const latestHivCareplanId = data.hivPositiveTracking.fhirID;
      this.patientLatestHivCareplanId.set(patientId, latestHivCareplanId);
      this.mappingPipelineEmitter.emit('hiv-careplan', patientId, latestHivCareplanId);
    }
  }

  runFollowUp(followUp, patientId) {
    // we need to match both the cervicalScreening object but also at least one of the careplan fields
    // since observations and procedures can also add the cervicalScreening object with different fields
    if (followUp.cervicalScreening && (
      followUp.cervicalScreening.treatmentReceivedDate ||
      followUp.cervicalScreening.precancerousLesionTreatmentReceived ||
      followUp.cervicalScreening.suspiciousCancerousLesionTreatmentReceived ||
      followUp.cervicalScreening.nextAppointmentDateForCCA)
    ) {
      this.store.setOrIncrementKey(patientId);
    }
  }

  runRaw(data) {
    super.runRaw();
    const patientId = data.subject.reference.replace('Patient/', '');
    const careplanType = data.category[0].coding[0].code;

    if (!this.patients.has(patientId)) return;
    
    // only update the count if we match with the current hiv careplan attached to the patient
    // since old ones are still in fhir-raw but have been overwritten in fhir-enrich
    if (careplanType === 'hiv-positive-tracking') {
      if (this.patientLatestHivCareplanId.get(patientId) === data.id) {
        this.store.setOrIncrementKey(patientId, -1);
      }
    } else {
      this.store.setOrIncrementKey(patientId, -1);
    }
  }

  clear() {
    super.clear();
    this.patientLatestHivCareplanId.clear();
  }
}