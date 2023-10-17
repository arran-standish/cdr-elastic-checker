import { registerPipeline, runPipelines } from './pipeline.js';
import { runEnrichPipelines } from './extractorPipelines/fhir-enrich-reports.js';
import { runRawPipelines } from './extractorPipelines/fhir-raw.js';
// make this a glob that you just import all files under that folder
import careplanPipeline from './mappingPipelines/careplanPipeline.js';
import medicationDispensePipeline from './mappingPipelines/medicationDispensePipeline.js';
import medicationStatementPipeline from './mappingPipelines/medicationStatementPipeline.js';

registerPipeline(careplanPipeline);
registerPipeline(medicationDispensePipeline);
registerPipeline(medicationStatementPipeline);

export { runPipelines, runEnrichPipelines, runRawPipelines };
