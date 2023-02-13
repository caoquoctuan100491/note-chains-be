//Version: 0.1.2 - Added MyID call to pass client username
//Version: 0.1.1 - Cleanup of profanity filter.
var config = require('./../configuarations/config');
// var log = require('tracer').colorConsole(config.loggingConfig);
// var swearjar = require('swearjar');
var auth = require('../auth.js');
const dbMoralis = require('../Entities/dbMoralis');
const moralis = new dbMoralis;
// const admin = require('firebase-admin');
// let db = admin.firestore();

// var Account = require('../Entities/Account');
// var eAccount = new Account();
let loggedInUsers = {};
module.exports = function (sio) {
    var io = sio.of('/chat');
    io.use(auth.authSocket);

    io.on('connection', function (socket) {
        //Decoded Token
        var token = socket.user;
        var username = token.data.username;
        loggedInUsers[username] = socket.id;
        socket.on('clientMessage', function (data) {
            io.emit('messageServer', { from: data.from, message: data.message });
        });

        socket.on('privateMessage', async function (data) {
            if (loggedInUsers[data.to]) {
                io.to(loggedInUsers[data.to]).emit('messagePrivate', data);
            } else {
                io.to(socket.id).emit('messagePrivate', { from: 'system', to: data.to, message: 'msg_chat3' });
            }
        });
        socket.on('disconnect', function (data) {
            loggedInUsers[username] = null;
        });
        function checkSocketId(id) {
            var res = id.split("#");
            return "/chat#" + id;
        }
    });
};
