var express = require("express");
const serverless = require("serverless-http");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var config = require("./src/configuarations/config");
var sticky = require("sticky-session");
var log = require("tracer").colorConsole(config.loggingConfig);
var loggedInUsers = {};
var online = 0;
/**
 * bodyParser
 */
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

if (
  !sticky.listen(server, config.port, {
    workers: process.env.MV_WORKER_COUNT || null,
  })
) {
  server.once("listening", function () {
    log.info("Master Server started on port: " + config.port);
  });
} else {
  log.info("Running on port: " + config.port);
  /**
   * app.use()
   */
  app.use("/", express.static(__dirname + "/origami-game-OriDungeon/www"));
  app.use("/user", require("./src/Routes/user"));
  app.use("/ev", require("./src/Routes/ev"));
  app.use("/player", require("./src/Routes/player"));
  app.use("/items", require("./src/Routes/items"));
  app.use("/bt", require("./src/Routes/battle"));
  app.use("/mkp", require("./src/Routes/mkp"));

  // ADD SOCKET IO MODULES HERE:
  //----------------------------------
  // var exampleSocket = require('./socket_modules/exampleSocket');
  var netplayers = require("./socket_modules/netplayer");
  var chat = require("./socket_modules/chat");
  var battle = require("./socket_modules/battle");
  var globalvar = require("./socket_modules/globalvar");
  var dbMoralis = require("./Entities/dbMoralis");
  const moralis = new dbMoralis();
  moralis.resetLogin();

  //Authorize socket connection with token from login
  var auth = require("./auth.js");
  io.use(auth.authSocket);
  //When first connected to Socket.io
  io.on("connection", function (socket) {
    online++;
    log.info(socket.id + " online");
    log.info(online + " player online");
    if (config.enforceOneUser && socket.user.data) {
      var username = socket.user.data.username;
      if (loggedInUsers[username]) {
        socket.to(loggedInUsers[username]).emit("firstShutDown", {});
        socket.emit("secondShutDown", {});
        io.of("/").sockets.get(loggedInUsers[username]).disconnect();
      }
      loggedInUsers[username] = socket.id;
    }

    socket.on("disconnect", function (data) {
      online--;
      log.info(socket.id + " offline");
      loggedInUsers[username] = null;
    });
  });

  //----------------------------------
  // BIND SOCKET IO MODULES HERE:
  //----------------------------------
  // exampleSocket(io);
  netplayers(io);
  chat(io);
  battle(io);
  globalvar(io);
} // <---Don't delete
module.exports.handler = serverless(app);
