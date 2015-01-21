'use strict';

var defaults = {
    serverHost: 'localhost',
    serverPort: 9000,
    appName: 'mtg:dev',
    staticFolder: 'src/'
};

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

// Module dependencies.
var express = require('express'),
    http = require('http'),
    passport = require('passport'),
    path = require('path'),
    fs = require('fs'),
    mongoStore = require('connect-mongo')(express),
    config = require('./src/server/config/config');

var app = express();

// Connect to database
var db = require('./src/server/db/mongo').db;

// Bootstrap models
var modelsPath = path.join(__dirname, 'src/server/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

var pass = require('./src/server/config/pass');

// App Configuration
app.configure('development', function(){
  app.use(express.static(path.join(__dirname, '.tmp')));
  app.use(express.static(path.join(__dirname, 'src')));
  app.use(express.errorHandler());
  app.set('views', __dirname + '/src/views');
});

app.configure('production', function(){
  app.use(express.favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', __dirname + '/views');
});

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.logger('dev'));

// cookieParser should be above session
app.use(express.cookieParser());

// bodyParser should be above methodOverride
app.use(express.bodyParser());
app.use(express.methodOverride());

// express/mongo session storage
app.use(express.session({
  secret: 'MEAN',
  store: new mongoStore({
    url: config.db,
    collection: 'sessions'
  })
}));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

//routes should be at the last
app.use(app.router);

//Bootstrap routes
require('./src/server/config/routes')(app);

http.createServer(app).listen(serverConfig.serverPort, function(){
    console.log('Express server listening on port %d in %s mode', serverConfig.serverPort, app.get('env'));
});