
/**
 * Module dependencies
 */

var express = require('express'),
    app = express(),
    defaults = {};

/**
 * Configuration
 */

// all environments
defaults.port=process.env.PORT || 3000;

// Create an HTTP service.
app.use(express.static(process.cwd() + '/public/'));

// Socket.io Communication
var io = require('socket.io').listen(app.listen(defaults.port));
require('./server/socket')(io);

console.log('Express server listening on port ' + defaults.port);
