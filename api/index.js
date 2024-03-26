const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { logger }  = require ('morgan');
const morgan = require('morgan');
const routes = require('./routes.js');
const cors = require('cors')
require('dotenv').config();

const constants = require('./constants.js');
const socketio = require('./socket.js');


let ips2listen = []
//console.log(constants.NODE_ENV_TXT,process.env.NODE_ENV);
if (process.env.NODE_ENV === constants.MODE_PRODUCTION) {
  console.log(constants.PRODUCTION_TXT);
  ips2listen = [constants.PRODUCTION_IP_1, constants.PRODUCTION_IP_2]
}else {
  console.log(constants.DEVELOPMENT_TXT);
  // ips2listen = [constants.DEVELOPMENT_IP_1, constants.DEVELOPMENT_IP_2]
  ips2listen = constants.DEVELOPMENT_IPS
  console.log(ips2listen)
}

const app = express()

app.use(cors());

const port = constants.PORT
const server = createServer(app)
const io = new Server(server,{
  cors: {
    origin: ips2listen,
  }
});

socketio.runSocketServer(io);

const pool = new Pool({
  host:  process.env.DB_HOST,
  user:  process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

// Routes
app.use('/', routes);


// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error(constants.ERROR_DATA_BASE, err);
    return;
  }
  console.log(constants.CONNECTED_DB);
  done();

});


// Middleware para habilitar CORS
app.use((req, res, next) => {
  const allowedOrigins = ips2listen;
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header(constants.ALLOW_ORIGIN, origin);
  }
  res.header(constants.ALLOW_METHODS, constants.METHODS);
  res.header(constants.ALLOW_HEADERS, constants.HEADERS);
  next();
});

server.listen(port, () => {
  console.log(` ${constants.SERVER_TXT} ${port}`);
});

// Handle SIGINT signal to close the database connection properly
process.on(constants.SIGINT, () => {
  pool.end(() => {
    console.log(constants.DISCONNECTED_DB);
    process.exit(0);
  });
});

