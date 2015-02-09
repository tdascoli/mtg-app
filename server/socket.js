module.exports = function (io) {
    'use strict';

    var usernames = {};
    var games = [];

    io.on('connection', function (socket) {

        //=== chat
        // broadcast a user's message to other users
        socket.on('send:message', function (data) {
            socket.broadcast.emit('send:message', {
                user: name,
                text: data.message
            });
        });

        //=== user
        socket.on('user:login', function (username) {
            socket.username = username;
            usernames[username] = username;
            console.log('user login',username);
        });

        //=== host games
        socket.on('host', function(name){
            socket.emit('mtg:update', 'SERVER', socket.username+' host this game: '+name);
            // define game (room)
            socket.game=name;
            // add game
            games[name]=name;
            socket.broadcast.emit('host:update', games, socket.game);
        });

        socket.on('host:debug', function(name){
            socket.emit('mtg:update', 'SERVER', socket.username+' host a debug game: '+name);
            // define game (room)
            socket.game=name;
            // add game
            games[name]=name;
        });

        socket.on('host:join', function(game){
            socket.game=game;
            joinGame(socket.game,socket.username);
        });

        function joinGame(game,username){
            socket.join(game);
            socket.emit('mtg:update', 'SERVER', username+' has connected to '+ game);
        }

        //=== playground
        socket.on('playground:drag', function (data) {
            console.log('drag',socket.username,socket.game);
            io.sockets.in(socket.game).emit('playground:drag', data);
        });
        socket.on('playground:action', function (data) {
            console.log('action',socket.username,socket.game);
            io.sockets.in(socket.game).emit('playground:action', data);
        });

        //=== common

        // when the user disconnects.. perform this
        socket.on('disconnect', function(){
            // todo: inform opponent, save in db?!

            // remove the username from global usernames list
            delete usernames[socket.username];
            // update list of users in chat, client-side
            io.sockets.emit('user:update', usernames);
            // echo globally that this client has left
            socket.broadcast.emit('mtg:update', 'SERVER', socket.username + ' has disconnected');
            socket.leave(socket.room);
        });
    });
};