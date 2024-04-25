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

async function gameWSMessagesListener(io,group,relaciones_socket_username) {
  relaciones_socket_username.forEach((s) => {
    // const received = (msg) => { console.log("received:" + msg); s.socket.off('hola-respuesta', received) };
    
    // s.socket.on('hola-respuesta', received);  

    // const onTurnoMovesTo = (username, position) => {
    //   // console.log("onTurnoMovesTo", username, position);
    //   io.to(group).emit('turno-moves-to', username, position);
    // }
    // s.socket.on('turno-moves-to', onTurnoMovesTo)
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
  gameWSMessagesListener(io,group,relaciones_socket_username);

  
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

  // players.forEach(async (player) => {
  // seleccionar un personaje aleatorio de entre los restantes si se comienza partida y aún no se ha seleccionado
  for (const player of players) {
    if (player.character === null) {
      const character = charactersAvailable[Math.floor(Math.random() * charactersAvailable.length)];
      charactersAvailable = charactersAvailable.filter((char) => char !== character);
      player.character = character;
      // console.log("Falta seleccionar personaje, se asigna " + character + " a " + player.userName);
      await controller.selectCharacter(player.userName, character);
    }
  };



  let dealCards = await controller.dealCards(players,group);

  relaciones_socket_username.forEach((s) => {
    const idx = players.findIndex((player) => player.userName === s.username); 
    io.to(s.socket_id).emit("cards", dealCards.cards[idx]); // 📩
  });


  const all_players = await controller.getPlayersCharacter(group);

  let bot_number = 0;
  const players_in_order = { username: [], character: [] };
  constants.CHARACTERS_NAMES.forEach((character) => {
    const player = all_players.players.find((player) => player.character === character);
    const username = player ? player.userName : "bot"+bot_number++; 
    players_in_order.username.push(username);
    players_in_order.character.push(character);
  });

  // console.log("players_in_order", players_in_order);


  // const { areAvailable } = await controller.availabilityCharacters(group);
  // console.log("areAvailable", areAvailable);

  relaciones_socket_username.forEach(async (s) => {
    io.to(s.socket_id).emit('start-game', { // 📩
      names: constants.CHARACTERS_NAMES, 
      guns: constants.GUNS_NAMES,
      rooms: constants.ROOMS_NAMES,
      available: players_in_order.username,
    });
  });


  // Avisar al primer jugador del grupo que es su turno
  let gameOver = false;
  let turno = -1;

  const handleTurnoBot = async (turnoOwner,group) => {
    // const {position, fin} = moveBot();
    // io.to(group).emit('turno-moves-to-response', turnoOwner, position); // 📩
    // if (!fin) {
    //   const { character, gun, room } = makeQuestion();
    //   io.to(group).emit('turno-asks-for-response', turnoOwner, character, gun, room); // 📩

    //   const username_shower = getFirstPlayerWithCard();

    // }

  };

  // Bucle de juego, donde se va cambiando el turno cuando corresponde. 
  // Lógica para manejar el turno de un jugador
  const handleTurno = async (turnoOwner, socketOwner) => {
    console.log("Es el turno de:", turnoOwner);
    io.to(group).emit('turno-owner', turnoOwner); // 📩

    if (turnoOwner.includes("bot")) {
      await handleTurnoBot(turnoOwner, group); // gestión de bot en otra función aparte
      handleNextTurn();
    }

    // Manejador para el evento turno-moves-to
    const onTurnoMovesTo = (username, position, fin) => {
      // reenviar a todos el movimiento del jugador
      io.to(group).emit('turno-moves-to-response', username, position); // 📩
      socketOwner.socket.off('turno-moves-to', onTurnoMovesTo);
      if (!fin) {
        // Entras en una habitación (se hace pregunta)
        console.log("El turno NO termina aquí");

        const onTurnoAsksFor = async (username_asking, character, gun, room) => {
          // reenviar la pregunta a todos los jugadores
          io.to(group).emit('turno-asks-for-response', username_asking, character, gun, room);
          socketOwner.socket.off('turno-asks-for', onTurnoAsksFor);

          // buscar quien es el jugador que debe enseñar la carta
          // llamar función 
          const { exito, user } = await controller.turno_asks_for(group, username_asking, character, gun, room, players_in_order.username);
          const username_shower = user;
          console.log("username_shower", username_shower);

          if (username_shower == "") {
            // nadie tiene cartas para enseñar
            io.to(group).emit('turno-show-cards', username_asking, "", "");
            setTimeout(() => {
              handleNextTurn();
            }, 2000);
          }
          else if (username_shower.includes("bot")) {
            // turno-show-cards (bot enseña carta a alguien) 🎃

          }
          else {
            // un jugador real enseña una carta
            const socket_shower = relaciones_socket_username.find((s) => s.username === username_shower);
            io.to(socket_shower.socket_id).emit('turno-select-to-show', username_asking, username_shower, character, gun, room);
            // socket_shower.socket.emit('turno-select-to-show', username, username_shower, character, gun, room);

            const onTurnoCardSelected = (username_asking, username_shower, card) => {
              // reenviar al resto de jugadores la carta mostrada
              io.to(group).emit('turno-show-cards', username_asking, username_shower, card, character, gun, room);
              socket_shower.socket.off('turno-card-selected', onTurnoCardSelected);
              setTimeout(() => {
                handleNextTurn();
            }, 2000);
            };
            socket_shower.socket.on('turno-card-selected', onTurnoCardSelected);
          }
        }
        socketOwner.socket.on('turno-asks-for', onTurnoAsksFor);
      } else {
        // No has entrado en ninguna habitación (no se hace pregunta)
        console.log("El turno termina aquí");

        // Continuar con el siguiente turno
        handleNextTurn();
      }
    };

    // Registrar el evento turno-moves-to para este jugador
    socketOwner.socket.on('turno-moves-to', onTurnoMovesTo);
  };

  // Lógica para manejar el próximo turno
  const handleNextTurn = () => {
    // Hacer un timeout para simular el tiempo de espera entre turnos
    setTimeout(() => {
      turno = (turno + 1) % players_in_order.username.length;
      const turnoOwner = players_in_order.username[turno];
      const characterOwner = players_in_order.character[turno];
      const socketOwner = relaciones_socket_username.find((s) => s.username === turnoOwner);
  
      if (turnoOwner.includes("bot")) { // borrar cuando se implemente lógica de bot 🎃
        handleNextTurn();
      }
      else {
        // Manejar el turno para el siguiente jugador
        handleTurno(turnoOwner, socketOwner);
      }
    }, 0);
  };

  // Iniciar el primer turno
  handleNextTurn();

 

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
  joinGame
};
