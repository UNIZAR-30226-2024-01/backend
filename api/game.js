const constants = require('./constants');
const { moveBot, updateCard } = require('../bot/bot');
const controller = require('./controller.js');

//orden de turnos: mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA
//posicion inicial asociada al personaje

// global para hacer efectivos los cambios en todas las funciones y métodos
let relaciones_socket_username = []

//declare a dictionary to store the players in order
let players_in_order = { username: [], character: [] };


async function joinGame(username, idGame) {
  //update jugador
  await controller.joinGame(username, idGame);
}


async function gameWSMessagesListener(io, group) {
  io.on(constants.CONNECT, async (socket) => {

    // si el socket es de mi grupo lo meto en 'relaciones_socket_username'
    // sino corto esta conexion--> conex de un user de otra partida
    console.log("se ha conectado a GAME.JS el socket:", socket.handshake.auth.username);

    
    if (socket.handshake.auth.group != group) {
      console.log("socket de otro grupo");
      // socket.disconnect();
      return;
    }

    // añadir al usuario a 'relaciones_socket_username' si no está (en caso de re-conexión)
    if (relaciones_socket_username.some((s) => s.username === socket.handshake.auth.username)) {
      // se da si abres la partida con 2 navegadores (o 2 tecnologias)
      // quitar de relaciones_socket_username al previo y meter al nuevo
      const s = relaciones_socket_username.find((s) => s.username === socket.handshake.auth.username);      
      s.socket.emit('close-connetion', {})
      s.socket.disconnect();

      
      // enviar al nuevo socket la información actual para que recupere el estado
      socket.emit('game-info', {
        names: constants.CHARACTERS_NAMES,
        guns: constants.GUNS_NAMES,
        rooms: constants.ROOMS_NAMES,
        available: players_in_order.username,
      });

      // 🎃 Descometar cuando esté hecha
      // const gameState = await controller.getPlayerStateInformation(group, socket.handshake.auth.username);
      const gameState = {
        positions: [368, 369, 370, 371, 372, 373],
        cards: ["cafe envenenado", "escaleras", "mr PROG"],
        sospechas: JSON.stringify(Array(28).fill('')),
        turnoOwner: "rold",
      }
      

      console.log("gameState", {
        posiciones: gameState.positions,
        cartas: gameState.cards,
        sospechas: gameState.sospechas,
        turnoOwner: gameState.turnoOwner,
      });

      // enviar estado actual de la partida: POSICIONES, CARTAS, SOSPECHAS, TURNO_OWNER, [PARTE_TURNO]
      socket.emit('game-state', {
        posiciones: gameState.positions,
        cartas: gameState.cards,
        sospechas: gameState.sospechas,
        turnoOwner: gameState.turnoOwner,
      });

      relaciones_socket_username = relaciones_socket_username.filter((s) => s.username !== socket.handshake.auth.username)
      relaciones_socket_username.push({ socket_id: socket.id, socket: socket, username: socket.handshake.auth.username });
    }
    // else: pertenezco a la partida ya empezada
    
    // lo meto en 'relaciones_socket_username' en la componente que toque
    // en funcion de su username (recuperar de la DB qu茅 character es en funci贸n de su username)


    // cuando se desconecta, lo saco de 'relaciones_socket_username'
  });
  
  relaciones_socket_username.forEach((s) => {
    s.socket.on(constants.DISCONNECT, () => {
      console.log('socket desconectado:', s.socket_id);
      relaciones_socket_username = relaciones_socket_username.filter((sock) => sock.socket_id !== s.socket_id);
    });
  });
}

// function that controls the game's state machine
async function runGame(io, group) {
  // Conseguir todos los sockets de los usuarios conectados al grupo
  const socketsSet = io.sockets.adapter.rooms.get(group);

  // Asociar a cada socket, el nombre de usuario del jugador correspondiente
  socketsSet.forEach((s) => {
    relaciones_socket_username.push({socket_id: s, socket:io.sockets.sockets.get(s), username: io.sockets.sockets.get(s).handshake.auth.username});
  });
  gameWSMessagesListener(io,group);
  
  await controller.removeBots(group)

  // get players with their characters
  let { players } = await controller.getPlayersCharacter(group);

  //charcters available has all the characters that are not selected by any player
  const characters = [constants.SOPER, constants.REDES, constants.PROG, constants.FISICA, constants.DISCRETO, constants.IA];
  let charactersAvailable = characters.filter((character) => !players.some((player) => player.character === character));

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

      console.log("Falta seleccionar personaje, se asigna " + character + " a " + player.userName);
      //update the character of the player in the database
      await controller.selectCharacter(player.userName, character);
    }
  });


  //calculate the number of bots needed
  const n_bots = charactersAvailable.length;
  
  //create bots
  let bots_inf=[]
  console.log("n_bots", n_bots);
  for (let i = 0; i < n_bots; i++) {

    //generate a random number between 1 and 3 for level
    let random_level = Math.floor(Math.random() * 3) + 1;

    //generate a name for the bot's username
    const username = "bot" + group.slice(2) + i;

    //insert bot in the database
    await controller.createBot(username,random_level);

    //join bot to the game
    await controller.joinGame(username, group);

    //save bot info in the array
    bots_inf.push({username: username, level: random_level});
  }


  
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
  

  // order players by character
  constants.CHARACTERS_NAMES.forEach((character) => {
    const player = all_players.players.find((player) => player.character === character);
    const username = player.userName ;
    players_in_order.username.push(username);
    players_in_order.character.push(character);
  });

  // const { areAvailable } = await controller.availabilityCharacters(group);
  // console.log("areAvailable", areAvailable);

  //send players the game start message with relevant information
  relaciones_socket_username.forEach(async (s) => {
    io.to(s.socket_id).emit('start-game', { // 馃摡
      names: constants.CHARACTERS_NAMES, 
      guns: constants.GUNS_NAMES,
      rooms: constants.ROOMS_NAMES,
      available: players_in_order.username,
      posiciones: [120, 432, 561, 16, 191, 566],
    });
  });



  // Avisar al primer jugador del grupo que es su turno

  const handleTurnoBot = async (turnoOwner,group) => {
    const {position, fin} = moveBot();
    io.to(group).emit('turno-moves-to-response', turnoOwner, position); // 📩
    if (!fin) {
      const { character, gun, room } = makeQuestion();
      io.to(group).emit('turno-asks-for-response', turnoOwner, character, gun, room); // 📩

      const username_shower = getFirstPlayerWithCard();
    }
  };

  // Bucle de juego, donde se va cambiando el turno cuando corresponde. 
  // Lógica para manejar el turno de un jugador
  const handleTurno = async (turnoOwner, socketOwner) => {
    console.log("Es el turno de:", turnoOwner);

    let timeoutId = setTimeout(() => { 
      // en caso de que se venza el tiempo del turno, se eliminan los eventos y se salta al siguiente turno
      console.log("Se ha acabado el tiempo del turno de", turnoOwner);
      socketOwner.socket.removeAllListeners();

      handleNextTurn();
      return;
    }, 47000); // dejar en 47 segundos 

    io.to(group).emit('turno-owner', turnoOwner); // 📩

    if (turnoOwner.includes("bot")) {
      await handleTurnoBot(turnoOwner, group); // gestión de bot en otra función aparte

      // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
      clearTimeout(timeoutId);
      socketOwner.interacted = true;

      handleNextTurn();
      return;
    }

    // Manejador para el evento turno-moves-to
    const onTurnoMovesTo = (username, position, fin) => {
      // reenviar a todos el movimiento del 
      console.log("El jugador", username, "se ha movido a la posición", position);
      io.to(group).emit('turno-moves-to-response', username, position); // 📩
      socketOwner.socket.off('turno-moves-to', onTurnoMovesTo);
      if (!fin) {
        // Entras en una habitación (se hace pregunta)
        console.log("El turno NO termina aquí");

        const onTurnoAsksFor = async (username_asking, character, gun, room, is_final) => {
          // reenviar la pregunta a todos los jugadores
          io.to(group).emit('turno-asks-for-response', username_asking, character, gun, room, is_final);
          socketOwner.socket.off('turno-asks-for', onTurnoAsksFor);

          if (is_final) {
            const { exito } = await controller.acuse_to(username, group, character, gun, room);
            io.to(group).emit('game-over', username_asking, exito);
            if (exito) {
              // eliminar la partida, players, ...
              console.log("FIN. Ha ganado el jugador: ", username_asking);
            } else {
              // eliminar al jugador que ha perdido
              // igual esto ya se hace en acuse_to
              console.log("FIN. Ha perdido la partida: ", username_asking);
              handleNextTurn();
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

              // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
              clearTimeout(timeoutId);

              setTimeout(() => {
                handleNextTurn();
                return;
              }, 2000);
            }
            else if (username_shower.includes("bot")) {
              // turno-show-cards (bot enseña carta a alguien) 🎃
              const { card } = bot.getCardFromQuestion(username_shower, character, gun, room);
              io.to(group).emit('turno-show-cards', username_asking, username_shower, card, character, gun, room);

              // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
              clearTimeout(timeoutId);

              handleNextTurn()
              return;
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

                // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
                clearTimeout(timeoutId);

                setTimeout(() => {
                  handleNextTurn();
                  return;
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

        // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
        clearTimeout(timeoutId);

        // Continuar con el siguiente turno
        handleNextTurn();
        return;
      }
      
    };

    // Si el jugador del turno no está conectado (socketOwner == undefined),
    // se     

    // Registrar el evento turno-moves-to para este jugador
    socketOwner.socket.on('turno-moves-to', onTurnoMovesTo);
  };

  // Lógica para manejar el próximo turno
  const handleNextTurn = () => {
    // Hacer un timeout para simular el tiempo de espera entre turnos
    setTimeout(async () => {

      const { exito, turno:turno_username } = await controller.changeTurn(group); // turno.turno es un username

      if (!exito) {
        console.log("Error al cambiar de turno");
        return;
      }

      // const idx = players_in_order.character.indexOf(turno.turno)
      const turnoOwner = turno_username;
      const socketOwner = relaciones_socket_username.find((s) => s.username === turnoOwner);

      // si al principio de tu turno no estás conectado, se salta al siguiente
        // borrar lo de los bots cuando se implemente lógica de bot 🎃
      if (!socketOwner || turnoOwner.includes("bot")) { 
        handleNextTurn();
      }
      else {
        // Manejar el turno para el siguiente jugador
        handleTurno(turnoOwner, socketOwner);
      }
    }, 0); // 👈🏼 0 en pruebas. Cuando funcione bien, dejar el timeout a 2 segundos (2000)
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
