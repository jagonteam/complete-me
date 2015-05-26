#!/bin/bash
### Initiliaze elastic indexes

if [ $# -lt 2 ]
then
	echo "ERROR: missing parameters, usage is init.sh <host_elastic> <port_elastic>"
	exit 1
fi

ELASTIC_HOSTNAME=$1
if [[ $ELASTIC_HOSTNAME != http* ]]; then
    ELASTIC_HOSTNAME=http://$ELASTIC_HOSTNAME
fi
ELASTIC_PORT=$2
if [[ $ELASTIC_PORT == "443" ]]; then
    ELASTIC_POST=
fi
ELASTIC_HOST="$ELASTIC_HOSTNAME:$ELASTIC_PORT"

# Deleting indexes
curl -sS -XDELETE $ELASTIC_HOST/query
curl -sS -XDELETE $ELASTIC_HOST/response_1
curl -sS -XDELETE $ELASTIC_HOST/response_2

# Creating indexes
curl -sS -XPUT $ELASTIC_HOST/query -d "@./settings/query_settings.json"
curl -sS -XPUT $ELASTIC_HOST/query/_mapping/query -d "@./mapping/query_mapping.json"
curl -sS -XPUT $ELASTIC_HOST/response_1 -d "@./settings/response_settings.json"
curl -sS -XPUT $ELASTIC_HOST/response_1/_mapping/response -d "@./mapping/response_mapping.json"
curl -sS -XPUT $ELASTIC_HOST/response_2 -d "@./settings/response_settings.json"
curl -sS -XPUT $ELASTIC_HOST/response_2/_mapping/response -d "@./mapping/response_mapping.json"

# Insert data bulk
curl -sS -XPUT $ELASTIC_HOST/_bulk --data-binary "@./bulk/query_bulk.json"
curl -sS -XPUT $ELASTIC_HOST/_bulk --data-binary "@./bulk/response_bulk.json"

# Creating alias on reponse_1
curl -sS -XPOST $ELASTIC_HOST/_aliases -d '
{
    "actions" : [
        { "add" : { "index" : "response_1", "alias" : "response" } }
    ]
}'
