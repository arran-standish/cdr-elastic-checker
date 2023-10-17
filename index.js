import { runEnrichPipelines, runRawPipelines } from './pipelines/index.js';

async function main() {
  await runEnrichPipelines('NEopQPE8Low');
  await runRawPipelines();
}

main();