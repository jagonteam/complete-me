# complete-me [![Build Status](https://travis-ci.org/jagonteam/complete-me.svg)](https://travis-ci.org/jagonteam/complete-me)

## Quick start

### With vagrant (get a development env in 2 minutes)

Launch the VM

    vagrant up

Start the application, in VM :

    vagrant ssh
    cd /vagrant
    node app.js

Open your browser : http://127.0.0.1:8080

### Old school mode

After cloning the repo, install building dependencies (assuming you installed node) :

    npm update -g npm
    npm install -g bower
    npm install -g gulp

Then, download dev dependencies :

    npm install
    bower install

If you do not have Elasticsearch :

    wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.5.1.deb
    sudo dpkg -i elasticsearch-1.5.1.deb

Start Elasticsearch :
    
    sudo service elasticsearch start    

Now, you need to convert ES6 sources to ES5.

    gulp transpilation

You can now start server :)

    node app.js

Open your browser, and browse to http://127.0.0.1:8080

