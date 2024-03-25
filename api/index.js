const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const { createServer } = require('http');
require('dotenv').config();
const { logger }  = require ('morgan');
const morgan = require('morgan');
const src = require('./src.js');
const constants = require('./constants.js');


let ips2listen = []
//console.log(constants.NODE_ENV_TXT,process.env.NODE_ENV);
if (process.env.NODE_ENV === constants.MODE_PRODUCTION) {
  console.log(constants.PRODUCTION_TXT);
  ips2listen = [constants.PRODUCTION_IP_1, constants.PRODUCTION_IP_2]
}else {
  console.log(constants.DEVELOPMENT_TXT);
  ips2listen = [constants.DEVELOPMENT_IP_1, constants.DEVELOPMENT_IP_2]
}

const app = express()
const port = constants.PORT
const server = createServer(app)
const io = new Server(server,{
  cors: {
    origin: ips2listen,
  }
});

const pool = new Pool({
  host:  process.env.DB_HOST,
  user:  process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})
app.use(bodyParser.json());


//----------------------------FUNCTION------------------------------------
async function storeMsg(currentTimestamp, group, isQ, msg, emisor) {
  try {
    const msgSaved = await src.saveMsg(currentTimestamp, group,isQ, msg, emisor);
    console.log(msgSaved.msg);
   
  } catch (error) {
    console.error(constants.ERROR_STORE_MSG, error);
  }
}


async function ldrMsg(socket) {
  if (!socket.recovered) {
    try {
      const offset = socket.handshake.auth.offset;
      const group = socket.handshake.auth.group;
      const result = await src.restoreMsg(offset,group);
      
      result.mensajes?.map(({emisor,mensaje}) => {
        socket.emit(constants.CHAT_RESPONSE, emisor,mensaje);
      })

    }catch (error) {
      console.error(constants.ERROR_LOAD_MSG, error);
   }
  }
}



function obtenerFechaActual() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (constants.CERO + (fecha.getMonth() + 1)).slice(-2);
  const dia = (constants.CERO + fecha.getDate()).slice(-2);
  const hora = (constants.CERO + fecha.getHours()).slice(-2);
  const minutos = (constants.CERO + fecha.getMinutes()).slice(-2);
  const segundos = (constants.CERO + fecha.getSeconds()).slice(-2);
  const milisegundos = (constants.CERO + fecha.getMilliseconds()).slice(-6); // Limitar a tres dígitos de precisión
  const zonaHorariaOffset = fecha.getTimezoneOffset();
  const signoZonaHoraria = zonaHorariaOffset > 0 ? constants.MENOS : constants.MAS;
  const horasZonaHoraria = (constants.CERO + constants.CERO);

  return `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}.${milisegundos}${signoZonaHoraria}${horasZonaHoraria}`;
  //"2024-03-14 12:54:56.419369+00"
}
//--------------------------------------------------------------------------------

const addSocketToGroup = (socket) => {
  const username = socket.handshake.auth.username
  const group = socket.handshake.auth.group
  socket.join(group)
}

io.on(constants.CONNECT, (socket) => {
  console.log(constants.USER_CONNECTED)

  addSocketToGroup(socket)

  socket.on(constants.DISCONNECT, () => {
    console.log(constants.USER_DISCONNECTED)
  })

  socket.on(constants.CHAT_MESSAGE, async (msg) => {

    io.to(socket.handshake.auth.group).emit(constants.CHAT_RESPONSE, socket.handshake.auth.username, msg);

    const emisor = socket.handshake.auth.username;
    const currentTimestamp = obtenerFechaActual();
    console.log(currentTimestamp);
    const group = socket.handshake.auth.group;
    const isQ = constants.STOP;
    await storeMsg(currentTimestamp,group,isQ,msg,emisor);
  })

  ldrMsg(socket);

})

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

app.get(constants.TEST, async (req, res) => {
  res.json({ success: true, message: constants.TEST});
});

app.post(constants.CREATE_ACCOUNT, async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  try {
    const createSuccessfully = await src.createAccount(username,password);
    res.json({ success: createSuccessfully.exito, message: createSuccessfully.msg});
    console.log(`${createSuccessfully.msg}  : ${createSuccessfully.username}`);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});


app.post(constants.LOGIN, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const resultadoLogin = await src.login(username,password);
    res.json({ success: resultadoLogin.exito, message: resultadoLogin.msg });
    console.log(resultadoLogin.msg);

  } catch (error) {
    console.error(constants.ERROR_LOGIN, error);
    res.status(500).json({ success: false, message: constants.ERROR_LOGIN });
  }
});


app.post(constants.XP, async (req, res) => {
  const username = req.body.username;
  try {
    const resultadoXp = await src.getPlayerXP(username);

    if (resultadoXp.exito) {
      res.status(200).json({ success: true, XP: resultadoXp.XP });
    } else {
      res.status(404).json({ success: false, message: resultadoXp.msg});
    }
  } catch (error) {
    console.error( constants.ERROR_XP , error);
    res.status(500).json({ success: false, message: constants.ERROR_XP });

  }
});

app.post(constants.CREATE_GAME, async (req, res) => {

  const username = req.body.username;
  const type = req.body.type;

  try {
    const createSuccessfully = await src.createGame(username,type);
    res.json({ success: createSuccessfully.exito, message: createSuccessfully.msg});
    console.log(`${createSuccessfully.msg}  : ${createSuccessfully.username}`);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});