#!/usr/bin/env bash

cd /vagrant

# see https://github.com/npm/npm/issues/3565
mkdir /tmp/node_modules
ln -sf /tmp/node_modules node_modules

# initialize dev environment
npm install
bower install --config.interactive=false
gulp transpilation

echo "You can now lanch node server with 'node app.js' in $(pwd)"
