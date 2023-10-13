import { Client } from '@elastic/elasticsearch';

const esHosts = process.env.ES_HOSTS
  .split(',')
  .map(esHost => 'http://' + esHost)

export const client = new Client({
  node: esHosts,
  auth: {
    username: process.env.ES_USERNAME,
    password: process.env.ES_PASSWORD,
  },
});
