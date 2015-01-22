#!/bin/env node
;(function() {

    'use strict';

    var defaults = {
        serverHost: 'localhost',
        serverPort: 9000,
        appName: 'mtg-app:dev',
        staticFolder: 'public/'
    };

    var staticFolder = process.argv[2] || defaults.staticFolder;

    var serverHost = process.env.OPENSHIFT_NODEJS_IP;
    if (!serverHost) {
        serverHost = defaults.serverHost;
        console.warn('No OPENSHIFT_NODEJS_IP environment variable, ' + defaults.serverHost + ' will be used.');
    }

    var serverPort = parseInt(process.env.OPENSHIFT_NODEJS_PORT);
    if (!serverPort) {
        serverPort = defaults.serverPort;
        console.warn('No OPENSHIFT_NODEJS_PORT environment variable, ' + defaults.serverPort + ' will be used.');
    }

    var appName = process.env.OPENSHIFT_APP_NAME;
    if (!appName) {
        appName = defaults.appName;
        console.warn('No OPENSHIFT_APP_NAME environment variable, ' + defaults.appName + ' will be used.');
    }

    var serverConfig = {
        serverHost: serverHost,
        serverPort: serverPort,
        appName: appName
    };


    function createServer(staticFolder){

        // Scope
        var server = {};
        var express = require('express');

        server.app = (function() {
            return express();
        }());

        (function registerTerminationListeners() {
            process.on('exit', function() { console.log('%s: Node server stopped.', new Date(Date.now()) ); });

            [
                'SIGHUP',
                'SIGINT',
                'SIGQUIT',
                'SIGILL',
                'SIGTRAP',
                'SIGABRT',
                'SIGBUS',
                'SIGFPE',
                'SIGUSR1',
                'SIGSEGV',
                'SIGUSR2',
                'SIGPIPE',
                'SIGTERM'
            ].forEach(function(element) {
                    process.on(element, function() {
                        console.log('%s: Received %s - terminating Node server ...', new Date(Date.now()), element);
                        process.exit(1);
                        console.log('%s: Node server stopped.', new Date(Date.now()) ); });
                }
            );
        }());

        server.start = function() {
            var http = require('http');
            // Create an HTTP service.
            server.app.use(express.static(process.cwd() + '/' + staticFolder));
            http.createServer(server.app).listen(serverConfig.serverPort);
        };

        return server;
    }


    process.argv.forEach(function(val, index) {
        if (index === 2) {
            staticFolder = val;
        }
    });
    var server = createServer(staticFolder).start();



}());
