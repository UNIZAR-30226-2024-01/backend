const constants = require("./constants.js");
const controller = require("./controller.js");
const game = require("./game.js");

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
  const horasZonaHoraria = constants.CERO + constants.CERO;

  return `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}.${milisegundos}${signoZonaHoraria}${horasZonaHoraria}`;
  //"2024-03-14 12:54:56.419369+00"
}

function formattedDate(date){

  let oldDate = new Date(date);
  
  // Formatear las partes de la hora para que tengan dos dígitos (agregar ceros a la izquierda si es necesario)
  const hours = (constants.CERO + oldDate.getHours()).slice(-2);
  const minutes = (constants.CERO + oldDate.getMinutes()).slice(-2);
  const seconds = (constants.CERO + oldDate.getSeconds()).slice(-2);
  
  // Crear una cadena con las partes de la hora formateadas
  const newDate = hours + ':' + minutes + ':' + seconds;
  
  return newDate;

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
      let chatDate

      result.mensajes?.map(({ emisor, mensaje, instante }) => {
        chatDate = formattedDate(instante)
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
  io.on(constants.CONNECT, (socket) => {
    console.log(constants.USER_CONNECTED);

    addSocketToGroup(socket);
    game.runGame(io, 0);

    socket.on(constants.DISCONNECT, () => {
      console.log(constants.USER_DISCONNECTED);
    });

    socket.on(constants.CHAT_MESSAGE, async (msg) => {

      const emisor = socket.handshake.auth.username;
      const currentTimestamp = obtenerFechaActual();
      const formattedDate = formattedDate();

      io.to(socket.handshake.auth.group).emit(
        constants.CHAT_RESPONSE,
        emisor,
        msg,
        currentTimestamp,
        formattedDate
      );

      const group = socket.handshake.auth.group;
      const isQ = constants.STOP;
      await storeMsg(currentTimestamp, group, isQ, msg, emisor);
    });

    ldrMsg(socket);
  });
}

module.exports = {
  runSocketServer,
};
