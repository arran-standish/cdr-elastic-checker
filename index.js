import mapMixin from './mixins/mapMixins.js';
import objectMixin from './mixins/objectMixins.js';
import { execute } from './pipelines/index.js';

async function main() {
  await execute('NEopQPE8Low');
}

Object.assign(Map.prototype, mapMixin);
Object.assign(Object.prototype, objectMixin);
main();
