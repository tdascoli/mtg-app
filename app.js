var port = 3000;
var path= require("path"), http = require("http"), fs = require("fs");
var express = require("express");
var logging = require("log4js");
var logger = logging.getLogger('angoose');
logger.setLevel(logging.levels.DEBUG);
var app = express();
app.configure(function() {
    app.set('port', port);
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: '1234567890QWERTY'}));
    app.use(app.router);
    app.use(function(err, req, res, next){
        console.log("In default error handling", err);
        res.send(500, 'Unhandled error: '+ err);
    });
    app.use(express.methodOverride());
    app.use(express.static( './public'));
});

var options = {
    'module-dirs':  './server/models',
    logging:'TRACE',
    mongo_opts:'localhost:27017/mtg-app'
};
require("angoose").init(app, options);

// Socket.io Communication
var io = require('socket.io').listen(app.listen(port));
require('./server/socket')(io);

process.on('uncaughtException',function(e) {
    console.log(" Unhandled Error caught in server.js -----> : ",e,  e.stack);
});
