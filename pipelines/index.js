import { registerPipeline, runPipelines } from './pipeline.js';
import { unitOfWork as fhirEnrichRunner } from './extractorPipelines/fhir-enrich-reports.js';
import { unitOfWork as fhirRawRunner } from './extractorPipelines/fhir-raw.js';
// make this a glob that you just import all files under that folder
import careplanPipeline from './mappingPipelines/careplanPipeline.js';
import medicationDispensePipeline from './mappingPipelines/medicationDispensePipeline.js';

registerPipeline(careplanPipeline);
registerPipeline(medicationDispensePipeline);

export { runPipelines, fhirEnrichRunner, fhirRawRunner };
