const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const routes = require('./routes.js');
const cors = require('cors');
// const pool = require("./connectionManager");
require('dotenv').config();

const constants = require('./constants.js');
const socketio = require('./socket.js');

//connection to database
// pool.connect();

//mode
let ips2listen = [];
if (process.env.NODE_ENV === 'production') {
  ips2listen = constants.PRODUCTION_IPS;
} else {
  ips2listen = constants.DEVELOPMENT_IPS;
}
//ips2listen = [constants.DEVELOPMENT_IP_1, constants.DEVELOPMENT_IP_2]

console.log('Listening in : [ ' + ips2listen + ' ]');
console.log('Running in ' + process.env.NODE_ENV + ' mode');

const app = express();
app.use(cors());

// Routes
app.use('/', routes);

// Middleware para habilitar CORS
app.use((req, res, next) => {
  const allowedOrigins = ips2listen;
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header(constants.ALLOW_ORIGIN, origin);
  } else return res.status(403).json({ error: 'Origin not allowed' });

  res.header(constants.ALLOW_METHODS, constants.METHODS);
  res.header(constants.ALLOW_HEADERS, constants.HEADERS);
  next();
});

const port = constants.PORT;
const server = createServer(app);

server.listen(port, () => {
  console.log(`${constants.SERVER_TXT} ${port}`);
});

//
const io = new Server(server, {
  cors: {
    origin: ips2listen,
  },
});
socketio.runSocketServer(io);
