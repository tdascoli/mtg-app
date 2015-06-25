module.exports = function (io) {
    'use strict';

    var lodash = require('lodash');
    var usernames = {};
    var games = [];
    var savedGames = [];

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
            socket.emit('mtg:host:list', games);
        });

        //=== host games
        socket.on('host:debug', function(name){
            socket.emit('mtg:update', 'SERVER', socket.username+' host a debug game: '+name);
            // define game (room)
            socket.game=name;
        });

        //== HOST GAMES v2
        function mtgJoinGame(game,username){
            socket.join(game);
            io.sockets.in(game).emit('mtg:game:joined', username);
        }

        socket.on('mtg:host:game', function(name){
            // info
            socket.emit('mtg:update', socket.username, 'new game: '+name);

            // add room {name:newgame,player1:player1}
            games.push({name: name, player1: socket.username, player2: false, deckP1: false, deckP2: false});
            // define game (room)
            socket.game=name;
            socket.broadcast.emit('mtg:host:update', games, socket.game);
        });
        socket.on('mtg:join:game', function(game){
            // info
            socket.emit('mtg:update', socket.username, 'joined game: '+game);

            // join game
            socket.game=game;
            mtgJoinGame(socket.game,socket.username);

            var index = lodash.findIndex(games, {name: socket.game});
            if (index!==-1){
                if (games[index].player1!==socket.username){
                    games[index].player2=socket.username;
                }
            }
        });
        socket.on('mtg:load:game', function(game){
            // info
            socket.emit('mtg:update', socket.username, 'loaded game: '+game.name);

            // define game (room)
            socket.game=game.name;
            mtgJoinGame(socket.game,socket.username);

            var index = savedGames.indexOf(socket.game);
            if (index===-1){
                savedGames.push(game.name);
            }
            else {
                // ready
                lodash.remove(savedGames,index);
                io.sockets.in(socket.game).emit('mtg:game:init', {player1: game.player1, action:'ready'});
            }
        });
        socket.on('mtg:game:init', function(data){
            var index = lodash.findIndex(games, {name: socket.game});
            if (data.action==='deck'){
                if (games[index].player1===data.user){
                    games[index].deckP1=true;
                }
                else {
                    games[index].deckP2=true;
                }

                if (games[index].deckP1 && games[index].deckP2){
                    io.sockets.in(socket.game).emit('mtg:game:init', {player1: games[index].player1, player2: games[index].player2, action:'ready'});
                }
            }
            io.sockets.in(socket.game).emit('mtg:game:init', data);
        });
        socket.on('mtg:game:save', function(){
            // info
            socket.emit('mtg:update', socket.username, 'save game: '+socket.game);

            io.sockets.in(socket.game).emit('host:save', socket.username);
        });

        //=== playground
        socket.on('playground:drag', function (data) {
            io.sockets.in(socket.game).emit('playground:drag', data);
        });
        socket.on('playground:action', function (data) {
            io.sockets.in(socket.game).emit('playground:action', data);
        });

        //=== common

        // when the user disconnects.. perform this
        socket.on('disconnect', function(){
            // todo: inform opponent, flush game list?!, save in db?!
            // remove game from list
            lodash.remove(games,lodash.findIndex(games, {name: socket.game}));
            socket.emit('mtg:host:list', games);
            // remove the username from global usernames list
            delete usernames[socket.username];
            // update list of users in chat, client-side
            io.sockets.emit('user:update', usernames);
            // echo globally that this client has left
            socket.broadcast.emit('mtg:update', 'SERVER', socket.username + ' has disconnected');
            io.sockets.in(socket.game).emit('host:save', socket.username);
            socket.leave(socket.game);
        });
    });
};