// Módulo encargado de la realización de operaciones CRUD
//(Create, Read, Update, Delete) sobre la base de datos
const pool = require("./connectionManager");
const constants = require("./constants.js");

const verbose_pool_connect = false;
const verbose_client_release = false;

//**************************************LOGIN************************************************* */
//return exito and username
async function createAccount(username, password) {
  const selectQuery = constants.SELECT_USER_USUARIO;
  const selectValues = [username];

  const insertQuery_player = constants.INSERT_JUGADOR;
  const insertValues_player = [username, null, null, null, null, 0];

  const insertQuery_user = constants.INSERT_USUARIO;
  const insertValues_user = [username, password, 0, 0, 0, 0];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 1");
  try {
    //check if userName already exits
    const selectResult = await client.query(selectQuery, selectValues);

    //the userName already exits //return !exito and userName
    if (selectResult.rows.length > 0)
      return { exito: false, username: selectResult.rows[0].username };
    else {
      //username doesnt exist yet

      //insert the userName like player and user
      await client.query(
        insertQuery_player,
        insertValues_player
      );
      const insertResult_user = await client.query(
        insertQuery_user,
        insertValues_user
      );
      //return exito and userName
      return { exito: true, username: insertResult_user.rows[0].username };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release1")
  }
}

//return exito and msg
async function login(username, password) {
  const selectQuery = constants.SELECT_PASSWD_USUARIO;
  const selectValues = [username];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 2");
  try {
    //check if passwd of username is correct
    const selectResult = await client.query(selectQuery, selectValues);

    //username doesnt exist
    if (selectResult.rows.length == 0)
      return { exito: false, msg: constants.WRONG_USER };
    //wrong passwd
    else if (selectResult.rows[0].passwd != password)
      return { exito: false, msg: constants.WRONG_PASSWD };
    //login correcto
    else return { exito: true, msg: constants.CORRECT_LOGIN };
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release2")
  }
}

//return exito and msg
async function changePassword(username, oldPassword, newPassword) {
  const selectQuery = constants.SELECT_PASSWD_USUARIO;
  const selectValues = [username];

  const updateQuery_passwd = constants.UPDATE_PASSWD_USUARIO;
  const updateValues_passwd = [username, newPassword];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect3");
  try {
    //check if username exits
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length > 0) {
      //username exits
      //check if oldPasswd is correct
      if (selectResult.rows[0].passwd === oldPassword) {
        //correct oldPasswd

        //update values
        const updatetResult = await client.query(
          updateQuery_passwd,
          updateValues_passwd
        );
        //return exito and sucessful msg
        return { exito: true, msg: constants.CORRECT_CHANGE_PASSWD };
      } else return { exito: false, msg: constants.WRONG_PASSWD }; //incorrect oldPasswd  //return error and error msg : wrong passwd
    } else return { exito: false, msg: constants.WRONG_USER }; //username doesnt exist //return error and error msg : user doesnt exist
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release3")
  }
}

//*****************************************CHAT*********************************************** */
//return exito and msg
async function saveMsg(currentTimestamp, group, isQ, msg, emisor) {
  //falta meter isQ

  const insertQuery = constants.INSERT_CONVERSACION;
  const insertValues = [currentTimestamp, isQ, group, msg, emisor];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect4");
  try {
    // Realizar la consulta SELECT para verificar si la dirección ya existe
    const insertResult = await client.query(insertQuery, insertValues);

    if (insertResult.rows.length == 0) {
      //usuario no existe
      return { exito: false, msg: constants.WRONG_MSG };
    } else {
      //login correcto
      return { exito: true, msg: constants.CORRECT_MSG };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release4")
  }
}

//return exito and  if error -> msg else -> mensajes
async function restoreMsg(currentTimestamp, group) {
  const selectQuery = constants.SELECT_ALL_CONVERSACION;
  const selectValues = [currentTimestamp, group];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect5");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_LDR_MSG };
    } else {
      const mensajes = selectResult.rows.map((row) => ({
        mensaje: row.contenido,
        emisor: row.emisor,
        esPregunta: row.isQuestion,
        instante: row.instante,
      }));
      return { exito: true, mensajes: mensajes };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release5")
  }
}


//*****************************************player******************************************** */
//return exito and  if error -> msg else -> id_partida

// post: return availability of characters in the current game
// vector which has null at the index of the character that is available
// otherwise it has the index of the user that has the character
// ---------------------------------------------------------------------
// ['', '', '', '', '', ''] -> all characters are available
// ['', user1, '', '', '', ''] -> user1 has the character "missRedes"
// [mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA] -> order of characters
// ---------------------------------------------------------------------
async function availabilityCharacters(idGame) {
  
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect6");
  try {
    const availability_usernames = await currentCharacters(idGame);
    // console.log(availability_usernames);
    const availability = [];
    availability.length = constants.NUM_PLAYERS;
    availability.fill('');
    
    for (let i = 0; i < constants.NUM_PLAYERS; i++) {
      availability[i] = availability_usernames[i] == null ? '' : availability_usernames[i];
    }
  
    return {
      areAvailable: availability,
      characterAvaliable: constants.CHARACTERS_NAMES,
    }; // return the updated availability array
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release6")
  }
}

//pre: character is available
//post: character is assigned to the user
async function selectCharacter(username, character) {
  const updateQuery_player = constants.UPDATE_FICHA_JUGADOR;
  const updateValues_player = [username, character];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect7");
  try {
    const updateResult = await client.query(
      updateQuery_player,
      updateValues_player
    );

    console.log("updateResult.rows.length "+updateResult.rows.length);

    if (updateResult.rows.length == 0)
      return { exito: false, msg: constants.ERROR_UPDATING };
    else return { exito: true, msg: constants.CORRECT_UPDATE };
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release7")
  }
}

async function getPlayersCharacter(idGame) {
  //get player where partida=idGame
  const selectQuery = constants.SELECT_FICHA_JUGADOR;
  const selectValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect8");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      return {
        exito: true,
        players: selectResult.rows.map((row) => ({
          userName: row.username,
          character: row.ficha,
        })),
      };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release8")
  }
}

/**
 * Postcondition:
 * - If  "player" information is successfully retrieved from the database:
 *   - The function returns an object with the following properties:
 *     - exito: true if successful, false otherwise.
 *     - character: The character associated with the player, it's a character.
 *     - partida_actual: The ID of the current game the player is participating in.
 *     - sospechas: The string that contains the suspicions the player has raised.
 *     - posicion: The position of the player in the game.
 *     - estado: The current state of the player (0 --> inactive, 1 --> active).
 *     - partidas_jugadas: The total number of games played by the player.
 *     - partidas_ganadas_local: The number of games won locally by the player.
 *     - partidas_ganadas_online: The number of games won online by the player.
 *     - XP: The experience points earned by the player.
 * - If the player information cannot be found in the database:
 *   - The function returns an object with success set to false and a message indicating that the player ID is incorrect or not found.
 */
async function playerInformation(player) {
  // Query to fetch player information
  const selectQuery = constants.SELECT_INFO_JUGADOR;
  const selectValues = [player];

  // Connect to the database client
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect9");
  
  try {
    // Execute the query to fetch player information
    const selectResult = await client.query(selectQuery, selectValues);

    // Check if any results are found
    if (selectResult.rows.length === 0) {
      // If no results are found, return an error message
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      // If results are found, return player information
      return {
        exito: true,
        character: selectResult.rows[0].ficha,
        partida_actual: selectResult.rows[0].partida,
        sospechas: selectResult.rows[0].sospechas,
        posicion: selectResult.rows[0].posicion,
        estado: selectResult.rows[0].estado,
        partidas_jugadas: selectResult.rows[0].n_jugadas,
        partidas_ganadas_local: selectResult.rows[0].n_ganadas_local,
        partidas_ganadas_online: selectResult.rows[0].n_ganadas_online,
        XP: selectResult.rows[0].XP
      };
    }
  } catch (error) {
    // Catch and throw any errors that occur
    throw error;
  } finally {
    // Release the database client after usage
    client.release();
    if (verbose_client_release)
      console.log("cliente.release9")
  }
}

//DELETE 
async function getPlayerXP(username) {
  const selectQuery = constants.SELECT_XP_USUARIO;
  const selectValues = [username];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect10");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      return { exito: true, XP: selectResult.rows[0].XP };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release10")
  }
} // informacion como xp

async function getCards(player,idGame) {
  const selectQuery = constants.SELECT_CARTAS_JUGADOR;
  const selectValues = [player,idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect11");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      return {
        exito: true,
        cards: selectResult.rows.map((row) => ({
          card: row.cartas,
        })),
      };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release11")
  }
}

//reparte las cartas entre los playeres,
//podría pasarle todos los idplayeres que estan en la partida
// POST: devuelve las cartas en un vector en funcion de como han entrado en players
// si players = [user1, user2, user3] deveulve = [[c1,c2,c3],[c4,c5,c6],[c7,c8,c9]]
// siendo c1,c2,c3 las cartas de user1
async function dealCards(players,idGame) {
  //consulta que devuelve en una vector de vectores las cartas de cada player
  const selectQuery = constants.SELECT_CARTAS_DISTINT_SOLUTION;
  const selectValues = [idGame];
 
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect12");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      let cardsNotSolution = [];
      let playersUsername = [];
      for (let i = 0; i < selectResult.rows.length; i++) {
        cardsNotSolution[i] = selectResult.rows[i].cards;
        if(i < players.length){
          playersUsername[i] = players[i].username;
        }
      }
      const resultCards = await internalDealCards(playersUsername, cardsNotSolution, idGame);
      
     // console.log("resultCards "+resultCards.cards[0]);
      return { exito: true  , cards: resultCards.cards};
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release12")
  }
}

//async function getSuspicions(player) {}

//****************************************JUEGO*********************************************** */
async function gameExists(username) {
  //user hasnt started a play

  //DUDA: no sé si devolver false si existe o si no existe
  // si no existe el user --> false
  // si esta jugando una partida --> true
  // si no esta jugando ninguna partida --> false

  // check if user exits and has an active game
  const selectQuery = constants.SELECT_PARTIDAandSTATE_JUGADOR;
  const selectValues = [username];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect13");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      //username doesnt exist
      return { exito: false, msg: constants.WRONG_USER };
    } else if (selectResult.rows[0].estado != constants.STOP) {
      // user is playing
      return { exito: true, id_partida: selectResult.rows[0].partida };
    } else {
      //user can start a new play
      return { exito: true };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release13")
  }
}

//return exito and if error -> msg else -> id_partida
async function createGame(username, type) {
  var exito = false;
  do {
    const enteroSeisDigitos = generarEnteroSeisDigitos();
    const selectQuery = SELECT_ID_PARTIDA;
    const selectValues = [enteroSeisDigitos];

    const client = await pool.connect();
    if (verbose_pool_connect)
      console.log("pool connect14");
    try {
      //check if this id already exists
      const selectResult = await client.query(selectQuery, selectValues);

      if (selectResult.rows.length == 0) {
        // id doesnt exist

        //get solution cards
        const asesino = await getAsesino();
        const arma = await getArma();
        const lugar = await getLugar();
        const date = getCurrentDate();

        // try to insert into partida
        const insertQuery_partida = constants.INSERT_PARTIDA;
        const insertValues_partida = [
          enteroSeisDigitos,
          constants.PLAY,
          date,
          null,
          type,
          null,
          asesino,
          arma,
          lugar,
        ];

        const insertResult_partida = await client.query(
          insertQuery_partida,
          insertValues_partida
        );

        //insert_error
        if (insertResult_partida.rows.length == 0)
          return { exito: exito, msg: constants.ERROR_INSERTING };
        else {
          const id_partida = insertResult_partida.rows[0].id_partida;
          await joinGame(username, id_partida);
        }
        return { exito: exito, id_partida: id_partida };
      }
    } catch (error) {
      throw error;
    } finally {
      client.release();
      if (verbose_client_release)
        console.log("cliente.release14")
    }
  } while (!exito);
}

async function joinGame(username, idGame) {
  const updateQuery_player = constants.UPDATE_PARTIDAandSTATE_JUGADOR;
  const updateValues_player = [parseInt(idGame), username, constants.PLAY];

  // console.log(typeof idGame);
  // transformar idGame a int
  // const idGameInt = parseInt(idGame);

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect15");
  try {
    const updateResult = await client.query(
      updateQuery_player,
      updateValues_player
    );
  
    //update_error
    if (updateResult.rows.length == 0)
      return { exito: false, msg: constants.ERROR_UPDATING };
    else { 
      return { exito: true, id_partida: idGame };
    }
  } catch (error) {
      throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release15")
  }
}

async function leaveGame(username) {
  const updateQuery_player = constants.UPDATE_PARTIDAandSTATEandCHAR_JUGADOR;
  const updateValues_player = [null, username, constants.STOP, null];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect16");
  try {
    const updateResult = await client.query(
      updateQuery_player,
      updateValues_player
    );

    if (updateResult.rows.length == 0) {
      return { exito: false, msg: constants.ERROR_UPDATING };
    }
    else {

      return { exito: true, msg: constants.CORRECT_UPDATE };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release16")
  }
}

//change the state of the game to stop
async function stopGame(idGame) {
  const result = await changeGameState(idGame, constants.STOP);
  return { exito: result.exito}
}

//change the state of the game to play
async function resumeGame(idGame) {
  const result = await changeGameState(idGame, constants.PLAY);
  return { exito: result.exito}
}

async function finishGame(idGame) {
  const deleteChatsaQuery = constants.DELETE_GAME_CONVERSACION;
  const deleteChatsValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect17");
  try {
    const updatePartidaResult = await client.query(
      deleteChatsaQuery,
      deleteChatsValues
    );

    if (updatePartidaResult.rows.length == 0) {
      const updateStateandPartidaQuery =
        constants.UPDATE_STATEandPARTIDA_P_JUGADOR;
      const updateStateandPartidaValues = [idGame, constants.STOP, null];

      const deletePartidaQuery = constants.DELETE_ALL_PARTIDA;
      const deletePartidaValues = [idGame];

      await client.query(
        updateStateandPartidaQuery,
        updateStateandPartidaValues
      );
      await client.query(deletePartidaQuery, deletePartidaValues);

      //HAY QUE BORRAR TB LAS TABLAS DE RELACION CARTAS Y player

      return { exito: true, msg: constants.CORRECT_DELETE };
    } else return { exito: false, msg: constants.ERROR_DELETING };
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release17")
  }
}

/**
 * Postcondition:
 * - If  "player" information is successfully retrieved from the database:
 *   - The function returns an object with the following properties:
 *     - exito: true if successful, false otherwise.
 *     - estado: The current state of the play (0 --> inactive, 1 --> active, 'p' --> stopped).
 *     - fecha_ini: The intial date of the play .
 *     - tipo: The type of game ('l' --> local, 'o' --> online).
 *     - turno: The name of the character who is taking the turn .
 * - If the player information cannot be found in the database:
 *   - The function returns an object with success set to false and a message indicating that the player ID is incorrect or not found.
 */
async function gameInformation(idGame) {
  // Query to fetch player information
  const selectQuery = constants.SELECT_INFO_GAME;
  const selectValues = [idGame];

  // Connect to the database client
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect18");
  
  try {
    // Execute the query to fetch player information
    const selectResult = await client.query(selectQuery, selectValues);

    // Check if any results are found
    if (selectResult.rows.length === 0) {
      // If no results are found, return an error message
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      // If results are found, return player information
      return {
        exito: true,
        estado: selectResult.rows[0].estado,
        fecha_ini: selectResult.rows[0].ficha,
        tipo: selectResult.rows[0].tipo,
        turno: selectResult.rows[0].turno
      };
    }
  } catch (error) {
    // Catch and throw any errors that occur
    throw error;
  } finally {
    // Release the database client after usage
    client.release();
    if (verbose_client_release)
      console.log("cliente.release18")
  }
}

//check if the player has the card
async function playerHasCard(player, card, idGame) {
  const selectQuery = constants.SELECT_CARTA_JUGADOR;
  const selectValues = [player, card, idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect19");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      return { exito: true , card: selectResult.rows[0].carta, player: selectResult.rows[0].player};
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release19")
  }
} 


async function changeTurn(idGame) {
  //Pdte: update sospechas, position and others ..
  const selectQuery = constants.SELECT_TURN_PARTIDA;
  const selectValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect20");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      const turno_player = selectResult.rows[0].turno;

      for(let i = 0; i < constants.CHARACTERS_NAMES.length; i++){
        if(turno_player == constants.CHARACTERS_NAMES[i]){
          const updateQuery = constants.UPDATE_TURNO_PARTIDA;
          const new_turno = constants.CHARACTERS_NAMES[(i+1)%constants.CHARACTERS_NAMES.length];
          const updateValues = [idGame, new_turno];
          await client.query(updateQuery, updateValues);
          return { exito: true, turno: new_turno};
        }
      }
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release20")
  }
    
}

async function udpate_players_info(idPlayer, sospechas, position){

  let updateQuery, updateValues;

  if(position != null){
    updateQuery = constants.UPDATE_SOSPECHAS_POSITION;
    updateValues = [idPlayer, sospechas, position];
  }else{
    updateQuery = constants.UPDATE_SOSPECHAS;
    updateValues = [idPlayer, sospechas];
  }

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect21");
  try {
    const updateResult = await client.query(updateQuery, updateValues);

    if (updateResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      return { exito: true , msg: constants.CORRECT_UPDATE};
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release21")
  }
}

//devuelve el user mas cercano segun el orden de usernameByOrder que tiene alguna de las cartas
async function turno_asks_for(idGame, usernameQuestioner, characterCard, weaponCard, placeCard, usernameByOrder) {
  console.log("entra en turno_asks_for");
  const selectQuery = constants.SELECT_DETERMINADAS_CARTAS_JUGADOR;
  
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect22");
  try {
    //if the character is found, then check if the player has the card
    const selectValues= [idGame, characterCard, weaponCard, placeCard];
    const selectResult = await client.query(selectQuery, selectValues);
    console.log("selectResult.rows.length " + selectResult.rows.length);
    
    if(selectResult.rows.length == 0){
      console.log("no hay cartas");
      return { exito: true, user: ''}; //modificar

    } else {
      
    
      let resultArray = [];
      selectResult.rows.forEach(row => {
        resultArray.push({ exito: true, user: row.user, card: row.cartas });
      });
      console.log("resultArray "+resultArray);

      //eliminas las cartas que tiene el jugador que pregunta
      resultArray = resultArray.filter((row) => row.user !== usernameQuestioner);

      let i = usernameByOrder.indexOf(usernameQuestioner);
      resultArray = resultArray.slice(i+1).concat(resultArray.slice(0, i+1));
      // resultArray tiene ordenados los jugadores que tienen alguna de las cartas
      // quieres el primer jugador en el order de usernameByOrder a partir de ti, que aparece en resultArra
  
      return resultArray[0] ? { exito: true, user: resultArray[0].user} : { exito: true, user: ''}; 
    }    

  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release22")
  }
} 

async function acuse_to(
  player,
  idGame,
  characterCard,
  weaponCard,
  placeCard
) {
  const selectQuery = constants.SELECT_SOLUTION;
  const selectValues = [idGame, characterCard, weaponCard, placeCard];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect23");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      fail(idGame, player);
      return { exito: false, msg: constants.WRONG_ACUSE };
    } else {
      win(idGame, player);
      return { exito: true , msg: constants.CORRECT_ACUSE};
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release23")
  }

}

//sumar XP 
async function win(idGame, idPlayer) {
  //obtener num de bots and xp de los user que estan jugando
  await playerWin(idPlayer);
  await finishGame(idGame); 
}

//al perder, el jugador 
//socket se mantiene
async function fail(idGame, idPlayer) {
  await playerFail(idPlayer);
  await leaveGame(idGame); 
}


//********************************************AUX********************************************* */
// type = 'l' --> local
// type = 'o' --> online
async function playerWin(idPlayer, xp, type) {

  let updateQuery;
  if(type == constants.LOCAL) updateQuery = constants.UPDATE_WIN_JUGADOR_LOCAL;
  else updateQuery = constants.UPDATE_WIN_JUGADOR_ONLINE;

  const updateValues = [idPlayer, xp];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect32");
  try {
    const updateResult = await client.query(updateQuery, updateValues);


    if (updateResult.rows.length == 0) return { exito: false, msg: constants.WRONG_IDGAME };
    else{

      return { exito: true , msg: constants.CORRECT_UPDATE};
    } 

  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release32")
  }
}

function generarEnteroSeisDigitos() {
  var min = 100000;
  var max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentDate() {
  var fechaActual = new Date();

  var año = fechaActual.getFullYear();

  var mes = fechaActual.getMonth() + 1;

  var dia = fechaActual.getDate();

  // Formatear la fecha en el formato YYYY-MM-DD
  var fechaFormateada = año + "-" + mes + "-" + dia;

  // Mostrar la fecha formateada
  //console.log(fechaFormateada);
  return fechaFormateada;
}

async function getAsesino() {
  const determinar_asesino = constants.SELECT_NOMBRE_ASESINO;

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect24");
  try {
    const selectResult = await client.query(determinar_asesino);

    if (selectResult.rows.length == 0) {
      //usuario no existe
      return { exito: false, msg: constants.ERROR_ASESINO };
    } else {
      return selectResult.rows[0].nombre;
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release24")
  }
}

async function getArma() {
  const determinar_asesino = constants.SELECT_NOMBRE_ARMA;

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect25");
  try {
    const selectResult = await client.query(determinar_asesino);

    if (selectResult.rows.length == 0) {
      //usuario no existe
      return { exito: false, msg: constants.ERROR_ARMA };
    } else {
      return selectResult.rows[0].nombre;
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release25")
  }
}

async function getLugar() {
  const determinar_asesino = constants.SELECT_NOMBRE_LUGAR;

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect26");
  try {
    const selectResult = await client.query(determinar_asesino);

    if (selectResult.rows.length == 0) {
      //usuario no existe
      return { exito: false, msg: constants.ERROR_LUGAR };
    } else {
      return selectResult.rows[0].nombre;
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release26")
  }
}

async function internalDealCards(players, cards_available,idGame) {
  // Shuffle cards
  const cards = cards_available.slice(); // Copy the array to avoid modifying the original
  cards.sort(() => Math.random() - 0.5); // Sort randomly

  // Deal cards to each player
  const cards_player = Array.from({ length: constants.NUM_PLAYERS }, () => []);

  // Delete all cards from all players
  for (let i = 0; i < players.length; i++) {
    const playerIndex = i % constants.NUM_PLAYERS;
    await deleteCardsFromPlayer(players[playerIndex]);
  }

  for (let i = 0; i < cards.length; i++) {
    const playerIndex = i % constants.NUM_PLAYERS;

    // si es null, es que es un bot
    // por ahora se hace continue
    if (players[playerIndex] == null) continue;
    
    cards_player[playerIndex].push(cards[i]);

    await insertCards(players[playerIndex], cards[i], idGame);
  }

  return { exito: true, msg: constants.CORRECT_INSERT , cards: cards_player};

    //return { exito: false, msg: constants.ERROR_INSERTING };
}

// vector which has null at the index of the character that is available
// otherwise it has the index of the user that has the character
// ---------------------------------------------------------------------
// [null, null, null, null, null, null] -> all characters are available
// [null, user1, null, null, null, null] -> user1 has the character "missRedes"
// [mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA]
async function currentCharacters(idGame) {
  const selectQuery = constants.SELECT_FICHA_JUGADOR;
  const selectValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect27");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      const userNames = [];
      userNames.length = constants.NUM_PLAYERS;
      userNames.fill('');

      const character_idx = {
        [constants.SOPER]: 0,
        [constants.REDES]: 1,
        [constants.PROG]: 2,
        [constants.FISICA]: 3,
        [constants.DISCRETO]: 4,
        [constants.IA]: 5,
      };

      for (let i = 0; i < selectResult.rows.length; i++) {
        // console.log(selectResult.rows[i].userName + "= "+ character_idx[selectResult.rows[i].ficha]);
        userNames[character_idx[selectResult.rows[i].ficha]] =
          selectResult.rows[i].username;
      }
      // console.log("userNames which returned "+userNames);
      return  userNames; // return the updated availability array
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release27")
  }
}


async function insertCards(username,  card, idGame) {
  const insertQuery = constants.INSERT_CARTAS_JUGADOR; //insert relation cartas y player
  const insertValues = [username, card, idGame];

  console.log("insertValues " + insertValues);
  
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect28");
  try {
    const insertResult = await client.query(insertQuery, insertValues);
    
    if (insertResult.rows.length == 0) {
      return { exito: false, msg: constants.ERROR_INSERTING };
    } else {
      //console.log("insertValues "+insertValues);
      return { exito: true, msg: constants.CORRECT_INSERT };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release28")
  }
}

/*async function insertCards(idGame, character,  cards) {
  const characters_with_usernames = await currentCharacters(idGame);
  //usernames of all players in the game order by character name

  const insertQuery = constants.INSERT_CARTAS_JUGADOR; //insert relation cartas y player
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect");
  
  try {
    let errorEncountered = false;
    for (let i = 0; i < constants.NUM_PLAYERS && !errorEncountered; i++) {
      //iterator for each player

      for (let j = 0; j < constants.NUM_CARDS; j++) {
        // iterator for each card

        const insertValues = [cards[i][j], username]; // card and username
        await client.query(insertQuery, insertValues);

        if (insertResult.rows.length == 0) {
          // error inserting
          errorEncountered = true;
          break;
        }
      }
    }
    if (errorEncountered) {
      for (let i = 0; i < constants.NUM_PLAYERS; i++) {
        const username = characters_with_usernames.userNameOfCharacters[i]; // username of the player
        deleteCardsFromPlayer(username); //deleteCards
      }
      return { exito: false, msg: constants.ERROR_INSERTING };
    } else {

      return { exito: true, msg: constants.CORRECT_INSERT };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release")
  }
}*/

async function deleteCardsFromPlayer(player) {
  const deleteQuery = constants.DELETE_ALL_CARDS_FROM_JUGADOR;
  const deleteValues = [player];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect30");
  try {
    await client.query(deleteQuery, deleteValues);
  } catch (error) {
    throw error;
  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release30")
  }
}

async function changeGameState(idGame, state){
   // check if user exits and has an active game
   const updatePartidaQuery = constants.UPDATE_STATE_PARTIDA;
   //supnogo  que update tb el estado de los playerssss
   const updatePartidaValues = [idGame, state];
 
   const client = await pool.connect();
   if (verbose_pool_connect)
    console.log("pool connect31");
  try {
     const updatePartidaResult = await client.query(
       updatePartidaQuery,
       updatePartidaValues
     );
 
     if (updatePartidaResult.rows.length == 0)
       return { exito: false, msg: constants.ERROR_UPDATING };
     else return { exito: true };
   } catch (error) {
     throw error;
   } finally {
     client.release();
    if (verbose_client_release)
      console.log("cliente.release31") 
   }
}

async function createBot(idGame, lvl) {
   const crearBotQuery = constants.CREATE_BOT;
   //supnogo  que update tb el estado de los playerssss
   const crearBotValues = [idGame, lvl];
 
   const client = await pool.connect();
   if (verbose_pool_connect)
    console.log("pool connect32");
  try {
     const crearBotResult = await client.query(
       crearBotQuery,
       crearBotValues
     );
 
     if (crearBotResult.rows.length == 0)
       return { exito: false, msg: constants.ERROR_UPDATING };
     else return { exito: true };
   } catch (error) {
     throw error;
   } finally {
     client.release();
    if (verbose_client_release)
      console.log("cliente.release32") 
   }
}

//*****************************************EXPORTS******************************************** */

module.exports = {
  createAccount,
  login,
  changePassword,
  //*****************************************CHAT*********************************************** */
  saveMsg,
  restoreMsg,
  gameExists,
  //*****************************************JUEGO******************************************** */
  createGame,
  joinGame,
  leaveGame,
  gameInformation,
  dealCards,
  availabilityCharacters,
  selectCharacter,
  stopGame,
  resumeGame,
  finishGame,
  getPlayersCharacter,
  changeTurn,
  turno_asks_for,
  acuse_to,
  //****************************************player*********************************************** */
  playerInformation,
  getPlayerXP,
  getCards,
  playerHasCard,
  udpate_players_info,
};
