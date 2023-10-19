import { runEnrichPipelines } from './extractorPipelines/fhir-enrich-reports.js';
import { runRawPipelines } from './extractorPipelines/fhir-raw.js';
import { PatientPipeline }  from './mappingPipelines/patientPipeline.js';
import { CareplanPipeline } from './mappingPipelines/careplanPipeline.js';
import { MedicationDispensePipeline } from './mappingPipelines/medicationDispensePipeline.js';
import { MedicationStatementPipeline } from './mappingPipelines/medicationStatementPipeline.js';
import { ServiceRequestPipeline } from './mappingPipelines/serviceRequestPipeline.js';
import { RelatedPersonPipeline } from './mappingPipelines/relatedPersonPipeline.js';
import { QuestionnaireResponsePipeline } from './mappingPipelines/questionnaireResponsePipeline.js';
import { EncounterPipeline } from './mappingPipelines/encounterPipeline.js';
import { DiagnosticReportPipeline } from './mappingPipelines/diagnosticReportPipeline.js';
import { ObservationPipeline } from './mappingPipelines/observationPipeline.js';
import { ProcedurePipeline } from './mappingPipelines/procedurePipeline.js';

const pipelines = new Set();
const patientPipeline = new PatientPipeline();

pipelines.add(patientPipeline);
pipelines.add(new CareplanPipeline());
pipelines.add(new MedicationDispensePipeline());
pipelines.add(new MedicationStatementPipeline());
pipelines.add(new ServiceRequestPipeline());
pipelines.add(new RelatedPersonPipeline(new QuestionnaireResponsePipeline()));
pipelines.add(new EncounterPipeline());
pipelines.add(new DiagnosticReportPipeline());
pipelines.add(new ObservationPipeline());
pipelines.add(new ProcedurePipeline());

async function execute(healthFacilityId) {
  await runEnrichPipelines(healthFacilityId, pipelines);
  patientPipeline.emitPatientStore();
  await runRawPipelines(pipelines);
}

export { execute };
