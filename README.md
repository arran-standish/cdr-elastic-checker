# cdr-elastic-checker
Small console app to generate summary statistics about the differentials between the elastic fhir-raw index and fhir-enrich-reports for eth-cdr

## Running
In order to actually pull data from elastic you'll need to attach to the docker network on which elastic is running. By default in cdr these are not attachable and so the easiest (and way in which there is no down time on elastic) is to deploy a service into the swarm.
`docker stack deploy -c ./docker/docker-compose.yml test`
