import { fhirEnrichRunner, fhirRawRunner } from './pipelines/index.js';

async function main() {
  await fhirEnrichRunner('NEopQPE8Low');
  await fhirRawRunner();
}

main();