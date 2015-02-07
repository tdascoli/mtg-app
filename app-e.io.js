express = require('express');
app = require('express.io')();
app.http().io();

//build your realtime-web app

app.io.route('ready', function(req) {

    req.io.broadcast('new visitor');

    req.io.join(req.data);


    req.io.room(req.data).broadcast('announce', {
        message: 'New client in the ' + req.data + ' room. '
    })
});

app.use(express.static(process.cwd() + '/public/'));

app.listen(3000);