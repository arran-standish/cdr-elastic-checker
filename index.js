import mapMixin from './mixins/mapMixins.js';
import objectMixin from './mixins/objectMixins.js';
import { runEnrichPipelines, runRawPipelines } from './pipelines/index.js';

async function main() {
  await runEnrichPipelines('NEopQPE8Low');
  await runRawPipelines();
}

Object.assign(Map.prototype, mapMixin);
Object.assign(Object.prototype, objectMixin);
main();