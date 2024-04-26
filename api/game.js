const constants = require('./constants');
const { moveBot, updateCard } = require('../bot/bot');
const controller = require('./controller.js');

//orden de turnos: mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA
//posicion inicial asociada al personaje

async function joinGame(username, idGame) {
  //update jugador
  await controller.joinGame(username, idGame);
}


async function gameWSMessagesListener(io, group, relaciones_socket_username) {
  io.on('connection', (socket) => {

    // si el socket es de mi grupo lo meto en 'relaciones_socket_username'
    // sino corto esta conexion--> conex de un user de otra partida

    if (socket.handshake.auth.group != group) {
      console.log("socket de otro grupo");
      socket.disconnect();
      return;
    }
    // else: pertenezco a la partida ya empezada
    
    // lo meto en 'relaciones_socket_username' en la componente que toque
    // en funcion de su username (recuperar de la DB qu茅 character es en funci贸n de su username)



    // socket.on('disconnect', () => {
    //   console.log('socket desconectado:', socket.id);
    // });
  });

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

  //calculate the number of bots needed
  const n_bots = constants.NUM_PLAYERS - relaciones_socket_username.length;

  //create bots
  let bots_inf=[]
  for (let i = 0; i < n_bots; i++) {

    //generate a random number between 1 and 3 for level
    let random_level = Math.floor(Math.random() * 3) + 1;

    //generate a name for the bot's username
    const username = "bot" + group + i;

    //insert bot in the database
    await controller.createBot(username,random_level);

    //join bot to the game
    await controller.joinGame(username, group);

    //save bot info in the array
    bots_inf.push({username: username + i, level: random_level});
  }

  // get players with their characters
  let { players } = await controller.getPlayersCharacter(group);

  //charcters available has all the characters that are not selected by any player
  const characters = [constants.SOPER, constants.REDES, constants.PROG, constants.FISICA, constants.DISCRETO, constants.IA];
  let charactersAvailable = characters.filter((character) => !players.some((player) => player.character === character));
  
  //asociate to each bot an available character
  bots_inf.forEach(async (bot) => {

    //select a random character from the available characters
    const character = charactersAvailable[Math.floor(Math.random() * charactersAvailable.length)];

    //remove the character from the available characters
    charactersAvailable = charactersAvailable.filter((char) => char !== character);

    //update the character of the bot
    await controller.selectCharacter(bot.username, character);

    //add the bot to the players array
    players.push({userName: bot.username, character: character});
  });


  // choose a random character for each player that has not selected a character
  players.forEach(async (player) => {

    //if the player has not selected a character
    if (player.character === null) {

      //select a random character from the available characters
      const character = charactersAvailable[Math.floor(Math.random() * charactersAvailable.length)];

      //remove the character from the available characters
      charactersAvailable = charactersAvailable.filter((char) => char !== character);

      //update the character of the player
      player.character = character;

      // console.log("Falta seleccionar personaje, se asigna " + character + " a " + player.userName);
      //update the character of the player in the database
      await controller.selectCharacter(player.userName, character);
    }
  });


  //deal cards to players
  let dealCards = await controller.dealCards(players,group);

  // send cards to each player
  relaciones_socket_username.forEach((s) => {

    //find the index of the player in the players array
    const idx = players.findIndex((player) => player.userName === s.username); 

    //send the cards to the player
    io.to(s.socket_id).emit("cards", dealCards.cards[idx]); // 馃摡

  });

  // get all players with their characters
  const all_players = await controller.getPlayersCharacter(group);

  //declare a dictionary to store the players in order
  const players_in_order = { username: [], character: [] };

  // order players by character
  constants.CHARACTERS_NAMES.forEach((character) => {
    all_players.players.find((player) => player.character === character);
  });

  // console.log("players_in_order", players_in_order);
  // const { areAvailable } = await controller.availabilityCharacters(group);
  // console.log("areAvailable", areAvailable);

  //send players the game start message with relevant information
  relaciones_socket_username.forEach(async (s) => {
    io.to(s.socket_id).emit('start-game', { // 馃摡
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

        const onTurnoAsksFor = async (username_asking, character, gun, room, is_final) => {
          // reenviar la pregunta a todos los jugadores
          io.to(group).emit('turno-asks-for-response', username_asking, character, gun, is_final);
          socketOwner.socket.off('turno-asks-for', onTurnoAsksFor);

          if (is_final) {
            const { exito } = await controller.acuse_to(username, idGame, character, gun, room);
            io.to(group).emit('game-over', username_asking, exito);
            if (exito) {
              // eliminar la partida, players, ...
            } else {
              // eliminar al jugador que ha perdido
              // igual esto ya se hace en acuse_to
            }
          } else {
            

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
