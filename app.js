
/**
 * Module dependencies
 */

var express = require('express'),
    routes = require('./routes'),
    api = require('./routes/api'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    mongoStore = require('connect-mongo')(express),
    config = require('./server/config/config');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);

// Create an HTTP service.
app.use(express.static(process.cwd() + '/' + 'public/'));

// development only
if (app.get('env') === 'development') {
    app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
    // TODO
}

// Connect to database
var db = require('./server/db/mongo').db;

// Bootstrap models
var modelsPath = path.join(__dirname, 'server/models');
fs.readdirSync(modelsPath).forEach(function (file) {
    require(modelsPath + '/' + file);
});

// cookieParser should be above session
app.use(express.cookieParser());
// express/mongo session storage
app.use(express.session({
    secret: 'MEAN',
    store: new mongoStore({
        url: config.db,
        collection: 'sessions'
    })
}));

// JSON API
app.get('/api/name', api.name);


// Socket.io Communication
io.sockets.on('connection', require('./routes/socket'));

/**
 * Start Server
 */

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
