const constants = require('./constants');
const { botRun } = require('../bot/bot');
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

// function that controls the game's state machine
async function runGame(io, group) {
  let username;
  const num = 1;
  // const interval = setInterval(() => {
  //     username = `user${num+1}`
  //     console.log(`turno de ${username}`)
  //     io.to(""+group).emit(constants.CHAT_TURN, username);
  //     // io.emit(constants.CHAT_TURN, username);
  //     num++
  //     num %= 6;

  // }, 1000);

  objeto = {
    group: group,
    io: io,
  };

  // get all sockets in game
  const sockets = io.sockets.adapter.rooms.get(group);
  console.log(sockets);

  sockets.forEach((s) => {
    io.to(s).emit('hola', 'user1');
  });


  players = await controller.getPlayersCharacter(group);
  let dealCards = await controller.dealCards(group);
  let cardsOfPlayers = [constants.NUM_PLAYERS][constants.NUM_CARDS];
  cardsOfPlayers.fill(null);

  for(let i = 0; i < players.length; i++){
    cardsOfPlayers[i] = dealCards[i];
  }
  
  // character of each player
  players.forEach((player) => {
    console.log(`Username: ${player.userName}`);
    console.log(`Character: ${player.character}`);
  });


  // io.on("character-selected", (character) => {
  //   console.log("character selected", character);
  // });

  // ⬇ queda comentado porque no funciona en produccion
  // botRun(objeto)
}

module.exports = {
  runGame,
};
