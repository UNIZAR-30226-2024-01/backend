const constants = require("./constants");
const { botRun } = require("../bot/bot");
const { src } = require("./controller.js");

//orden de turnos: mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA
//posicion inicial asociada al personaje

async function joinGame(username, idGame) {
  //update jugador
  await src.joinGame(username, idGame);
}

/*    //asignar posicion asociada a personaje
    let posicion = 0;   
    switch(username){ //MODIFICAR VAL
        case constants.SOPER:
            posicion = 1;
            break;
        case constants.REDES:
            posicion = 2;
            break;
        case constants.PROG:
            posicion = 3;
            break;
        case constants.FISICA:
            posicion = 4;
            break;
        case constants.DISCRETO:
            posicion = 5;
            break;
        case constants.IA:
            posicion = 6;
            break;
    }*/

// function that change the turn of the player
async function runGame(socket, group) {
  let username;
  let num = 1;
  // const interval = setInterval(() => {
  //     username = `user${num+1}`
  //     console.log(`turno de ${username}`)
  //     socket.to(""+group).emit(constants.CHAT_TURN, username);
  //     // socket.emit(constants.CHAT_TURN, username);
  //     num++
  //     num %= 6;

  // }, 1000);

  objeto = {
    group: group,
    socket: socket,
  };

  console.log(socket.handshake);
  socket.on("join-game", (data) => {
    console.log("Se unio al juego");
    socket.emit("available-characters", {
      names: [
        "mr SOPER",
        "miss REDES",
        "mr PROG",
        "miss FISICA",
        "mr DISCRETO",
        "miss IA",
      ],
      characters: [true, true, true, true, true, false],
    });
  });
  // ⬇ queda comentado porque no funciona en produccion
  // botRun(objeto)
}

module.exports = {
  runGame,
};
