const constants = require('./constants.js');

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

  
const addSocketToGroup = (socket) => {
    const username = socket.handshake.auth.username
    const group = socket.handshake.auth.group
    socket.join(group)
}

function runSocketServer(io) {
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
}
    
module.exports = {
    runSocketServer
};