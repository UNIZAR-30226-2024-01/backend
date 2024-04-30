const constants = require('./constants');
const { moveBot, updateCard , createBot} = require('../bot/bot');
const controller = require('./controller.js');

//orden de turnos: mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA
//posicion inicial asociada al personaje

// global para hacer efectivos los cambios en todas las funciones y métodos
let relaciones_socket_username = []

//declare a dictionary to store the players in order
let players_in_order = { };

// variable to store the pause state of the game and the io object
let game_info = { };


async function gameWSMessagesListener(io, group) {
  io.on(constants.CONNECT, async (socket) => {

    console.log("se ha conectado a GAME.JS el socket:", socket.handshake.auth.username);

    // si el socket es de mi grupo lo meto en 'relaciones_socket_username'
    // sino, corto esta conexion (usuario conectado en otra partida)
    if (socket.handshake.auth.group != group) return;

    // añadir al usuario a 'relaciones_socket_username' si no está (en caso de re-conexión)
    if (relaciones_socket_username.some((s) => s.username === socket.handshake.auth.username)) {
      // se da si abres la partida con 2 navegadores (o 2 tecnologias)
      // quitar de relaciones_socket_username al previo y meter al nuevo
      const s = relaciones_socket_username.find((s) => s.username === socket.handshake.auth.username);      

      console.log("socket antiguo:", s.socket_id);
      s.socket.emit('close-connection', {}); // 🎃 mensaje para echar al socket antiguo

      s.socket.disconnect();

      // enviar al nuevo socket la información actual para que recupere el estado
      socket.emit('game-info', {
        names: constants.CHARACTERS_NAMES,
        guns: constants.GUNS_NAMES,
        rooms: constants.ROOMS_NAMES,
        available: players_in_order.group.username,
      });

      relaciones_socket_username = relaciones_socket_username.filter((s) => s.username !== socket.handshake.auth.username)
      relaciones_socket_username.push({ socket_id: socket.id, socket: socket, username: socket.handshake.auth.username });
    }
    // else: pertenezco a la partida ya empezada
    
    // lo meto en 'relaciones_socket_username' en la componente que toque
    // en funcion de su username (recuperar de la DB qu茅 character es en funci贸n de su username)


    // cuando se desconecta, lo saco de 'relaciones_socket_username'
  });
  
  const relaciones_socket_username_group = relaciones_socket_username.filter((s) => s.group === group);
  relaciones_socket_username_group.forEach((s) => {
    s.socket.on(constants.DISCONNECT, () => {
      console.log('socket desconectado:', s.socket_id);
      relaciones_socket_username = relaciones_socket_username.filter((sock) => sock.socket_id !== s.socket_id);
    });

    const group = s.group;

    s.socket.on('request-pause-game', async () => {
      console.log('request-pause-game');
      game_info.group.pause = true;

      await controller.stopGame(group);
    });

    s.socket.on('request-resume-game', async () => {
      console.log('request-resume-game');
      const io = game_info.group.io;
      io.to(group).emit('game-resumed-response', {}); // 📩
      game_info.group.pause = false;

      await controller.resumeGame(group);

      handleNextTurn(group, io);
      // handleNextTurn(group, io).catch(error => console.error(error));
    });
  });
}

// function that controls the game's state machine
async function runGame(io, group) {

  await controller.resumeGame(group);
  game_info.group = { pause: false, io: io };
  // Conseguir todos los sockets de los usuarios conectados al grupo
  const socketsSet = io.sockets.adapter.rooms.get(group);

  // Asociar a cada socket, el nombre de usuario del jugador correspondiente
  socketsSet.forEach((s) => {
    relaciones_socket_username.push({socket_id: s, socket:io.sockets.sockets.get(s), username: io.sockets.sockets.get(s).handshake.auth.username , group: group});
  });
  gameWSMessagesListener(io,group);
  
  await controller.removeBots(group)

  // get players with their characters
  let { players } = await controller.getPlayersCharacter(group);

  //charcters available has all the characters that are not selected by any player
  const characters = [constants.SOPER, constants.REDES, constants.PROG, constants.FISICA, constants.DISCRETO, constants.IA];
  let charactersAvailable = characters.filter((character) => !players.some((player) => player.character === character));

  // choose a random character for each player that has not selected a character
  //players.forEach(async (player) => {});

  for (const player of players) {
    //if the player has not selected a character
    if (player.character === null) {

      //select a random character from the available characters
      const character = charactersAvailable[Math.floor(Math.random() * charactersAvailable.length)];

      //remove the character from the available characters
      charactersAvailable = charactersAvailable.filter((char) => char !== character);

      //update the character of the player
      player.character = character;

      //update the character of the player in the database
      await controller.selectCharacter(player.userName, character);
    }
  }


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
  for (const bot of bots_inf) {

    //select a random character from the available characters
    const character = charactersAvailable[Math.floor(Math.random() * charactersAvailable.length)];

    //remove the character from the available characters
    charactersAvailable = charactersAvailable.filter((char) => char !== character);

    //update the character of the bot
    await controller.selectCharacter(bot.username, character);

    //add the bot to the players array
    players.push({userName: bot.username, character: character});
  };


  //deal cards to players
  let dealCards = await controller.dealCards(players, group);
  console.log("dealCards", dealCards);

  // send cards to each player
  relaciones_socket_username.forEach((s) => {

    //find the index of the player in the players array
    const idx = players.findIndex((player) => player.userName === s.username); 

    //send the cards to the player
    io.to(s.socket_id).emit("cards", dealCards.cards[idx]); // 馃摡

  });
  
  for(let bot of bots_inf){
    //find the index of the player in the players array
    const idx = players.findIndex((player) => player.userName === bot.username); 
    const data = createBot(idx,  dealCards.cards[idx]);
    await controller.update_players_info(bot.username, data, null);

  }
  

  // get all players with their characters
  const all_players = await controller.getPlayersCharacter(group);
  
  players_in_order.group = { username: [], character: [] };

  // order players by character
  constants.CHARACTERS_NAMES.forEach((character) => {
    const player = all_players.players.find((player) => player.character === character);
    const username = player.userName;
    players_in_order.group.username.push(username);
    players_in_order.group.character.push(character);
  });


  // const { areAvailable } = await controller.availabilityCharacters(group);
  // console.log("areAvailable", areAvailable);

  //send players the game start message with relevant information
  relaciones_socket_username.forEach(async (s) => {
    io.to(s.socket_id).emit('start-game', { // 📩😍
      names: constants.CHARACTERS_NAMES, 
      guns: constants.GUNS_NAMES,
      rooms: constants.ROOMS_NAMES,
      available: players_in_order.group.username,
      posiciones: [120, 432, 561, 16, 191, 566],
    });
  });

  // Iniciar el primer turno
  handleNextTurn(group, io);
}
  // Avisar al primer jugador del grupo que es su turno

const handleTurnoBot = async (turnoOwner,group,character) => {

  // get the dice between 2 and 12
  const dice = Math.floor(Math.random() * 11) + 2;
  const me = constants.CHARACTERS_NAMES.indexOf(character);
  
  const { exito, positions, usernames } = await information_for_bot(group);
  console.log("positions", positions);

  let data = await moveBot(positions,me,dice,sospechas);
  data = data.split(",");
  console.log("data", data);
  
  //io.to(group).emit('turno-moves-to-response', turnoOwner, position); // 📩
  //check if the bot has entered a room
  let move = parseInt(data[1]);
  controller.updatePosition(turnoOwner, move);
  
  io.to(group).emit('turno-moves-to-response', turnoOwner, move); // 📩
  // const fin = ( data[2] == -1 ? true : false);
  const fin = (data[2] != '-1');

  
  if (!fin) {
    
    const suspect = data[2] == 'SUSPECT' ;
    let room = data[3];
    console.log("room", room);
    let character = data[4];
    console.log("character", character);
    let gun = data[5];
    console.log("gun", gun);
    
    console.log(players_in_order.group);
    io.to(group).emit('turno-asks-for-response', turnoOwner, character, gun, room, !suspect); // LUO

    if(suspect){
      const { exito, user }   = await turno_asks_for( turnoOwner, character, gun, room, players_in_order.group);
      const username_shower = user;
      
      if (username_shower == "") {
        // nadie tiene cartas para enseñar
        io.to(group).emit('turno-show-cards', turnoOwner, "", "");
        // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
        clearTimeout(timeoutId);

        const idx_card = -1;
        await actualizar_bots(group, username_shower, turnoOwner, idx_card, room, character, gun);
        handleNextTurn(group, io);
        return;

      } else if (username_shower.includes("bot")) {
        const { exito, card } = controller.getCards(turnoOwner,idGame);
        let cards_coincidences = card.filter((card) => card == character || card == gun || card == room);
        //Get random card of cards_coincidences
        let card_to_show = cards_coincidences[Math.floor(Math.random() * cards_coincidences.length)];
        
        io.to(group).emit('turno-show-cards', turnoOwner, username_shower, card_to_show, character, gun, room);

        // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
        clearTimeout(timeoutId);

        const card_type = card_to_show == character ? 0 : (card_to_show == gun ? 1 : 2);
        await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);

        handleNextTurn(group, io)
        return;

      } else {
        // un jugador real enseña una carta
        const socket_shower = relaciones_socket_username.find((s) => s.username === username_shower);
        io.to(socket_shower.socket_id).emit('turno-select-to-show', turnoOwner, username_shower, character, gun, room);
        // socket_shower.socket.emit('turno-select-to-show', username, username_shower, character, gun, room);

        const onTurnoCardSelected = async (turnoOwner, username_shower, card) => {
          // reenviar al resto de jugadores la carta mostrada
          io.to(group).emit('turno-show-cards', turnoOwner, username_shower, card, character, gun, room);
          socket_shower.socket.off('turno-card-selected', onTurnoCardSelected);

          // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
          clearTimeout(timeoutId);

          const card_type = card_to_show == character ? 0 : (card_to_show == gun ? 1 : 2);
          await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
          handleNextTurn(group, io);
          return;
        };
        socket_shower.socket.on('turno-card-selected', onTurnoCardSelected);
      }

    }else { //Accuse_to
      const { exito } = await controller.acuse_to(turnoOwner, group, character, gun, room);
      io.to(group).emit('game-over', turnoOwner, exito);
      if (exito) {
        // eliminar la partida, players, ...
        clearTimeout(timeoutId);
        console.log("FIN. Ha ganado el jugador: ", turnoOwner);
        return;
      } else {
        // eliminar al jugador que ha perdido
        // igual esto ya se hace en acuse_to
        console.log("FIN. Ha perdido la partida: ", turnoOwner);

        // const card_type = card_to_show == character ? 0 : (card_to_show == gun ? 1 : 2);
        // await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
        handleNextTurn(group, io);
        return;
      }
    }
  }
};

//updateCard(me, lvl, asker, holder, where, who, what, hasSmg, tarjeta)
const actualizar_bots = async (group, hold, turnoOwner, idx_card, where, who, what) => {
  //solo bots
  const bots = await controller.getBotsInfo(group);
  const { positions, usernames } = await controller.information_for_bot(group);

  // Iterador sobre bots.personajes
  for (let bot of bots.personajes) {
    // Si bot no es undefined, se actualiza la carta enseñada por el bot
    if (bot) {
      const idx = bots.personajes.indexOf(bot);
      let asker = usernames.indexOf(turnoOwner);
      let holder = usernames.indexOf(hold);
      updateCard(idx, bots.niveles[idx], asker, holder , where, who, what, idx_card, bots.sospechas[idx])
        .then((data) => {
          controller.update_players_info(players_in_order.group.username[idx], data, null)
          then(() => {
            console.log('updateCard terminado.');
          })
        })
        .catch(error => {
          console.error('Hubo un error:', error);
        });
    }
  }
}

// Bucle de juego, donde se va cambiando el turno cuando corresponde. 
// Lógica para manejar el turno de un jugador
const handleTurno = async (turnoOwner, socketOwner, characterOwner, group,io) => {
  console.log("Es el turno de:", turnoOwner);

  let timeoutId = setTimeout(() => { 
    // en caso de que se venza el tiempo del turno, se eliminan los eventos y se salta al siguiente turno
    console.log("Se ha acabado el tiempo del turno de", turnoOwner);
    socketOwner.socket.removeAllListeners();

    handleNextTurn(group, io);
    return;
  }, 47000); // dejar en 47 segundos 

  io.to(group).emit('turno-owner', turnoOwner); // 📩

  if (turnoOwner.includes("bot")) {
    await handleTurnoBot(turnoOwner, group, characterOwner); // gestión de bot en otra función aparte

    // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
    clearTimeout(timeoutId);

    handleNextTurn(group,io);
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
          const { exito } = await controller.acuse_to(username_asking, group, character, gun, room);
          io.to(group).emit('game-over', username_asking, exito);
          if (exito) {
            // eliminar la partida, players, ...
            clearTimeout(timeoutId);
            console.log("FIN. Ha ganado el jugador: ", username_asking);
            return;
          } else {
            // eliminar al jugador que ha perdido
            // igual esto ya se hace en acuse_to
            console.log("FIN. Ha perdido la partida: ", username_asking);

            //const card_type = card_to_show == character ? 0 : (card_to_show == gun ? 1 : 2);
            //await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
            handleNextTurn(group, io);
            return;
          }
        } else {
          // buscar quien es el jugador que debe enseñar la carta
          // llamar función 
          const { user } = await controller.turno_asks_for(group, username_asking, character, gun, room, players_in_order.group.username);
          const username_shower = user;
          console.log("username_shower", username_shower);

          if (username_shower == "") {
            // nadie tiene cartas para enseñar
            io.to(group).emit('turno-show-cards', username_asking, "", "");

            // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
            clearTimeout(timeoutId);

            await actualizar_bots(group, username_shower, turnoOwner, -1, room, character, gun);
            handleNextTurn(group, io);
            return;
          }
          else if (username_shower.includes("bot")) {
            const { cards } = await controller.getCards(username_shower,group);
            let cards_coincidences = cards.filter((card) => card == character || card == gun || card == room);
            //Get random card of cards_coincidences
            let card_to_show = cards_coincidences[Math.floor(Math.random() * cards_coincidences.length)];
            
            io.to(group).emit('turno-show-cards', turnoOwner, username_shower, card_to_show, character, gun, room);
  
            // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
            clearTimeout(timeoutId);

            const card_type = card_to_show == character ? 0 : (card_to_show == gun ? 1 : 2);
            await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
            handleNextTurn(group, io)
            return;
          }
          else {
            // un jugador real enseña una carta
            const socket_shower = relaciones_socket_username.find((s) => s.username === username_shower);
            io.to(socket_shower.socket_id).emit('turno-select-to-show', username_asking, username_shower, character, gun, room);
            // socket_shower.socket.emit('turno-select-to-show', username, username_shower, character, gun, room);

            const onTurnoCardSelected = async (username_asking, username_shower, card) => {
              // reenviar al resto de jugadores la carta mostrada
              io.to(group).emit('turno-show-cards', username_asking, username_shower, card, character, gun, room);
              socket_shower.socket.off('turno-card-selected', onTurnoCardSelected);

              // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
              clearTimeout(timeoutId);
              
              const card_type = card == character ? 0 : (card == gun ? 1 : 2);
              await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
              handleNextTurn(group, io);
              return;
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
      handleNextTurn(group, io);
      return;
    }
    
  };

  // Si el jugador del turno no está conectado (socketOwner == undefined),
  // se     

  // Registrar el evento turno-moves-to para este jugador
  socketOwner.socket.on('turno-moves-to', onTurnoMovesTo);
};

// Lógica para manejar el próximo turno
const handleNextTurn = (group, io) => {

  // guardar todas las sospechas de los usuarios 

  if (game_info.group.pause) {
    io.to(group).emit('game-paused-response', {}); // 📩
    return;
  };
  
  setTimeout(async () => {

    const { exito, turno:turno_username, character } = await controller.changeTurn(group); // turno.turno es un username

    if (!exito) {
      console.log("Error al cambiar de turno");
      return;
    }

    console.log("El turno ha pasado a:", turno_username);

    const turnoOwner = turno_username;
    const socketOwner = relaciones_socket_username.find((s) => s.username === turnoOwner);

    // si al principio de tu turno no estás conectado, se salta al siguiente
      // borrar lo de los bots cuando se implemente lógica de bot 🎃
    if (!socketOwner) { 
      handleNextTurn(group, io);
    }
    else {
      // Manejar el turno para el siguiente jugador
      handleTurno(turnoOwner, socketOwner, character, group, io);
    }
  }, 0); // 👈🏼 0 en pruebas. Cuando funcione bien, dejar el timeout a 2 segundos (2000)
};


module.exports = {
  runGame,
};
