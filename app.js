var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose'),
    fs = require('fs'),
    users = [];

server.listen(3000);

mongoose.connect('mongodb://localhost/chat', function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("success");
    }
});

var chatSchema = mongoose.Schema({
    username: String,
    message: String,
    time: {
        type: Date,
        default: Date.now
    }
});

var Chat = mongoose.model('Message', chatSchema);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    function updateUsers() {
        io.sockets.emit('new_user', users);
    }

    socket.on('send_message', function(data) {
        var userIndex = users.indexOf(socket.username);
        var newMsg = new Chat({
            username: socket.username,
            message: data
        });
        newMsg.save(function(err) {
            if (err) throw err;
            io.sockets.emit('new_message', {
                username: socket.username,
                message: data,
                userIndex: userIndex
            });
        });
    });

    socket.on('new_connect', function(data, callback) {
        Chat.find({}, function(err, docs) {
            if (err) throw err;
            console.log("success");
            socket.emit("load old messages", docs);
        });
        if (users.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsers();
        }
    });

    socket.on('disconnect', function(data) {
        if (socket.username) {
            users.splice(users.indexOf(socket.username), 1);
            updateUsers();
        }
        return false;
    });

    socket.on('Start', function(data) {
        var Name = data['Name'];
        var Place = 0;
        fs.open("Temp/" + Name, 'a', 0755, function(err, fd) {
            if (err) {
                console.log(err);
            } else {
                socket.emit('MoreData', {
                    'Place': Place,
                    Percent: 0
                });
            }
        });
    });
});
