#!/usr/bin/env bash

#
# This file install dev tools on the virtual machine
#

# constants
ES_VERSION=1.5.1


	#=================#
	# basic dev tools #
	#=================#

apt-get update
apt-get install -y vim curl git byobu build-essential htop


	#=================#
	#     nodejs      #
	#=================#

apt-get install -y python-software-properties python g++ make
add-apt-repository -y ppa:chris-lea/node.js
apt-get update
apt-get install -y nodejs

npm update -g npm
npm install -g bower gulp

chown -R vagrant:vagrant /home/vagrant/.npm


	#=================#
	#     Elastic     #
	#=================#

## install java
apt-get install -y openjdk-7-jre-headless
 
## install elasticsearch
wget -nv https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-${ES_VERSION}.deb
dpkg -i elasticsearch-${ES_VERSION}.deb
service elasticsearch start
 
## install es plugins
X_PROXY=
if [ ! -z "${HTTP_PROXY}" ]
then
	proxy_hostport=$(echo $HTTP_PROXY | awk -F/ '{print $3}')
	proxy_host=$(echo $proxy_hostport | awk -F: '{print $1}')
	proxy_port=$(echo $proxy_hostport | awk -F: '{print $2}')
	X_PROXY="`echo '-DproxyPort='``echo ${proxy_port}` `echo '-DproxyHost='``echo ${proxy_host}`"
fi

/usr/share/elasticsearch/bin/plugin ${X_PROXY} -install mobz/elasticsearch-head 
/usr/share/elasticsearch/bin/plugin ${X_PROXY} -install elasticsearch/marvel/latest 

## restart es
service elasticsearch restart
