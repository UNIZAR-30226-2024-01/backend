const constants = require('./constants.js');
const controller = require('./controller.js');
const game = require('./game.js');

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
  const signoZonaHoraria =
    zonaHorariaOffset > 0 ? constants.MENOS : constants.MAS;
  const horasZonaHoraria = (
    '0' + Math.abs(fecha.getTimezoneOffset() / 60)
  ).slice(-2);

  return `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}.${milisegundos}${signoZonaHoraria}${horasZonaHoraria}`;
  //"2024-03-14 12:54:56.419369+00"
}

function formattedDate(date) {
  const oldDate = new Date(date);
  const currentDate = new Date();

  // Check if oldDate and currentDate are on the same day
  if (
    oldDate.getDate() === currentDate.getDate() &&
    oldDate.getMonth() === currentDate.getMonth() &&
    oldDate.getFullYear() === currentDate.getFullYear()
  ) {
    // Format the parts of the time to have two digits (add zeros to the left if necessary)
    const hours = ('0' + oldDate.getHours()).slice(-2);
    const minutes = ('0' + oldDate.getMinutes()).slice(-2);

    // Create a string with the formatted parts of the time
    const newDate = hours + ':' + minutes; /* + ':' + seconds */

    return newDate;
  } else {
    // Calculate the difference in days
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((currentDate - oldDate) / oneDay));

    return diffDays === 1 ? 'ayer' : 'hace ' + diffDays + ' días';
  }
}
async function storeMsg(currentTimestamp, group, isQ, msg, emisor) {
  try {
    const msgSaved = await controller.saveMsg(
      currentTimestamp,
      group,
      isQ,
      msg,
      emisor
    );
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
      const result = await controller.restoreMsg(offset, group);
      let chatDate;

      result.mensajes?.map(({ emisor, mensaje, instante }) => {
        chatDate = formattedDate(instante);
        socket.emit(constants.CHAT_RESPONSE, emisor, mensaje, offset, chatDate);
      });
    } catch (error) {
      console.error(constants.ERROR_LOAD_MSG, error);
    }
  }
}

const addSocketToGroup = (socket) => {
  const username = socket.handshake.auth.username;
  const group = socket.handshake.auth.group;
  socket.join(group);
};

function runSocketServer(io) {
  io.on(constants.CONNECT, async(socket) => {
    // console.log(socket)
    // console.log(constants.USER_CONNECTED + socket.handshake.auth.username);

    addSocketToGroup(socket);
    // añadir usuario a la partida en la DB (partida_actual)
    // console.log( typeof socket.handshake.auth.group);
    controller.joinGame(socket.handshake.auth.username, socket.handshake.auth.group);
    
    
    socket.on(constants.DISCONNECT, async() => {
      console.log(constants.USER_DISCONNECTED);

      /////////////////////////////////////////////////////////////////////////
      // 👇 SOLO ES PARA PROBAR Y DESARROLLAR
      // DEBERÁ ELIMINARSE
      //disconnect
      const {areAvailable} = await controller.availabilityCharacters(socket.handshake.auth.group);
      const index = areAvailable.indexOf(socket.handshake.auth.username);
      areAvailable[index] = '';

      controller.leaveGame(socket.handshake.auth.username);

      io.emit('game-info', {
        names: constants.CHARACTERS_NAMES,
        guns: constants.GUNS_NAMES,
        rooms: constants.ROOMS_NAMES,
        available: areAvailable,
      });
      /////////////////////////////////////////////////////////////////////////
    });

    // INFO DE JUEGO
    socket.on('request-game-info', async() => {
      const {areAvailable} = await controller.availabilityCharacters(socket.handshake.auth.group);
      // console.log(constants.CHARACTERS_NAMES);
      io.to(socket.handshake.auth.group).emit('game-info', {
        names: constants.CHARACTERS_NAMES, 
        guns: constants.GUNS_NAMES,
        rooms: constants.ROOMS_NAMES,
        available: areAvailable,
      });
    });

    socket.on('character-selected', async (character) => {
      // console.log('character-selected: ', character);
      const index = constants.CHARACTERS_NAMES.indexOf(character);
      const {areAvailable} = await controller.availabilityCharacters(socket.handshake.auth.group);
      areAvailable[index] = socket.handshake.auth.username;
      // console.log("available "+ areAvailable);

      // avisar al backend que yo (username) he elegido el personaje character
      // haciendo update sobre el campo availability de la base de datos
      // console.log("username " + socket.handshake.auth.username);
      // console.log("character " + character);
      await controller.selectCharacter(socket.handshake.auth.username, character);
      // const d = await controller.availabilityCharacters(socket.handshake.auth.group);
      // console.log("available "+ d.areAvailable);

      io.to(socket.handshake.auth.group).emit('game-info', {
        names: constants.CHARACTERS_NAMES,
        guns: constants.GUNS_NAMES,
        rooms: constants.ROOMS_NAMES,
        available: areAvailable,
      });
    });

    // CHAT
    socket.on(constants.CHAT_MESSAGE, async(msg) => {
      const emisor = socket.handshake.auth.username;
      const currentTimestamp = obtenerFechaActual();
      const date = formattedDate(currentTimestamp);

      io.to(socket.handshake.auth.group).emit(
        constants.CHAT_RESPONSE,
        emisor,
        msg,
        currentTimestamp,
        date
      );

      const group = socket.handshake.auth.group;
      const isQ = constants.STOP;
      await storeMsg(currentTimestamp, group, isQ, msg, emisor);
    });


    // LÓGICA DE PARTIDA
    socket.on('start-game', async() => {
      console.log('start game received');
      game.runGame(io, socket.handshake.auth.group);
    });

    // gestionar cambio de turno
    

    ldrMsg(socket);
  });
}

module.exports = {
  runSocketServer,
};
