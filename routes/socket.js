/*
 * Serve content over a socket
 */
// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
        nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());

var games = (function () {
  var games = {};

  var claim = function (name) {
    if (!name || games[name]) {
      return false;
    } else {
      games[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGameName = function () {
    var name,
        nextId = 1;

    do {
      name = 'Game ' + nextId;
      nextId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (game in games) {
      res.push(game);
    }

    return res;
  };

  var free = function (name) {
    if (games[name]) {
      delete games[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGameName: getGameName
  };
}());
// export function for listening to the socket
module.exports = function (socket) {
  var name = userNames.getGuestName();

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get(),
    games: games.get()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

    // notify other clients that a new user has loggedin
    socket.on('user:login', function (data) {
        socket.broadcast.emit('send:message', {
            user: data
        });
    });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
  });

  // playground
  socket.on('playground:drag', function (data) {
    socket.broadcast.emit('playground:drag', {
      user: name,
      offset: data.offset
    });
  });
  socket.on('playground:action', function (data) {
    socket.broadcast.emit('playground:action', {
      user: name,
      action: data.action,
      appendix: data.appendix
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};
