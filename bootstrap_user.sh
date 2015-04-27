#!/usr/bin/env bash

#
# This file configure dev tools on the virtual machine, as a developer
# should to start working on this project.
#

cd /vagrant

# see https://github.com/npm/npm/issues/3565
mkdir /tmp/node_modules
ln -sf /tmp/node_modules node_modules


## set ES configuration, and initialize content
cd elastic
sudo mv /etc/elasticsearch/elasticsearch.yml /etc/elasticsearch/elasticsearch.yml.original
sudo ln -s $(pwd)/elasticsearch.yml /etc/elasticsearch/elasticsearch.yml
sudo service elasticsearch restart
sleep 10
./init.sh 127.0.0.1 9200
cd -

## initialize node service
npm install
bower install --config.interactive=false
gulp transpilation


echo -e " \n \n "
echo "____________________________________________________________________________________"
echo "Congratulation ! You can now launch node server with 'node server/app.js' in $(pwd)"
echo "---"
echo "Forwarded ports (available on your host) :"
echo "  * node server  : 8080"
echo "  * elastic HTTP : 9200"
echo "  * elastic TCP  : 9300"
echo "____________________________________________________________________________________"
echo -e " \n "
