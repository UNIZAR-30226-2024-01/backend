const constants = require('./constants');
const { moveBot, updateCard } = require('../bot/bot');
const controller = require('./controller.js');

//orden de turnos: mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA
//posicion inicial asociada al personaje

async function joinGame(username, idGame) {
  //update jugador
  await controller.joinGame(username, idGame);
}
/*
 posicion asociada a personaje
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

async function gameWSMessagesListener(relaciones_socket_username) {
  relaciones_socket_username.forEach((s) => {
    const received = (msg) => { console.log("received:" + msg); s.socket.off('hola-respuesta', received) };
    
    s.socket.on('hola-respuesta', received);  
  });

  // gestionar movimiento de ficha en tablero

  // gestionar cambio de turno

}

// function that controls the game's state machine
async function runGame(io, group) {
  // Conseguir todos los sockets de los usuarios conectados al grupo
  const socketsSet = io.sockets.adapter.rooms.get(group);

  // Asociar a cada socket, el nombre de usuario del jugador correspondiente
  let relaciones_socket_username = []
  socketsSet.forEach((s) => {
    relaciones_socket_username.push({socket_id: s, socket:io.sockets.sockets.get(s), username: io.sockets.sockets.get(s).handshake.auth.username});
  });
  gameWSMessagesListener(relaciones_socket_username);
  relaciones_socket_username.forEach((s) => {
    io.to(s.socket_id).emit('hola', s.username);
  });
  
  // let username;
  // const num = 1;
  // const interval = setInterval(() => {
  //     username = `user${num+1}`
  //     console.log(`turno de ${username}`)
  //     io.to(""+group).emit(constants.CHAT_TURN, username);
  //     // io.emit(constants.CHAT_TURN, username);
  //     num++
  //     num %= 6;

  // }, 1000);



  let { players } = await controller.getPlayersCharacter(group);
  const characters = [constants.SOPER, constants.REDES, constants.PROG, constants.FISICA, constants.DISCRETO, constants.IA];
  let charactersAvailable = characters.filter((character) => !players.some((player) => player.character === character));

  players.forEach(async (player) => {
    if (player.character === null) {
      const character = charactersAvailable[Math.floor(Math.random() * charactersAvailable.length)];
      charactersAvailable = charactersAvailable.filter((char) => char !== character);
      player.character = character;
      console.log("Falta seleccionar personaje, se asigna " + character + " a " + player.userName);
      await controller.selectCharacter(player.userName, character);
      const {areAvailable} = await controller.availabilityCharacters(0);
      console.log(areAvailable);
    }
  });

  let dealCards = await controller.dealCards(players,group);

  relaciones_socket_username.forEach((s) => {
    const idx = players.findIndex((player) => player.userName === s.username); 
    io.to(s.socket_id).emit("cards", dealCards.cards[idx]);
  });



  // // Mandar a cada jugador sus cartas
  // players.forEach((player, character) => {
  //   const index = 0;
  //   switch(character){
  //     case constants.SOPER: index = 0; break;
  //     case constants.REDES: index = 1; break;
  //     case constants.PROG: index = 2; break;
  //     case constants.FISICA: index = 3; break; 
  //     case constants.DISCRETO: index = 4; break;
  //     case constants.IA: index = 5; break;
  //   }

  //   // conseguir el socket del jugador 
  //   const socket = relaciones_socket_username.find((relacion) => relacion.username === player.userName).socket;

  //   // mandar a cada jugador sus cartas correspondientes
  //   io.to(socket).emit('cards', cardsOfPlayers[index]);
  // });

  // Avisar al primer jugador del grupo que es su turno

  /* Bucle de juego, donde se va cambiando el turno cuando corresponde. 
    while (!gameOver) { 
      ...
    }
  */

  // io.on("character-selected", (character) => {
  //   console.log("character selected", character);
  // });

// BOTS
  // objeto = {
  //   group: group,
  //   io: io,
  // };
  // ⬇ queda comentado porque no funciona en produccion
  // moveBot(objeto)
}

module.exports = {
  runGame,
};
