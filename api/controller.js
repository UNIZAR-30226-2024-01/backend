// Módulo encargado de la realización de operaciones CRUD (Create, Read, Update, Delete) sobre la base de datos
const pool = require('./connectionManager');
const constants = require('./constants.js');


//**************************************LOGIN************************************************* */
//return exito and username
async function createAccount(username, password) {

    const selectQuery = constants.SELECT_USER_USUARIO;
    const selectValues = [username];
    
    const insertQuery_jugador= constants.INSERT_JUGADOR;
    const insertValues_jugador= [username, null, null,null,null,0];

    const insertQuery_user= constants.INSERT_USUARIO;
    const insertValues_user = [username, password, 0,0,0,0];

    const client = await pool.connect();
    try {

        //check if "userName" already exits
        const selectResult = await client.query(selectQuery, selectValues);

        //the userName already exits //return !exito and userName
        if (selectResult.rows.length > 0) return {exito: false, username: selectResult.rows[0].userName};

        else { //username doesnt exist yet

            //insert the userName like player and user
            const insertResult_jugador = await client.query(insertQuery_jugador, insertValues_jugador);
            const insertResult_user = await client.query(insertQuery_user, insertValues_user);
            //return exito and userName
            return {exito: true, username: insertResult_user.rows[0].userName};

        }

    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

//return exito and msg
async function login(username, password) {

    const selectQuery = constants.SELECT_PASSWD_USUARIO;
    const selectValues = [username];

    const client = await pool.connect();
    try {

        //check if passwd of username is correct
        const selectResult = await client.query(selectQuery, selectValues);

        //username doesnt exist
        if(selectResult.rows.length == 0) return {exito: false, msg: constants.WRONG_USER};  

        //wrong passwd
        else if (selectResult.rows[0].passwd != password ) return {exito: false, msg: constants.WRONG_PASSWD}; 

        //login correcto
        else return {exito: true, msg: constants.CORRECT_LOGIN }; 

    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

//return exito and msg
async function changePassword(username, oldPassword, newPassword ) {

    const selectQuery = constants.SELECT_PASSWD_USUARIO;
    const selectValues = [username];
    
    const updateQuery_passwd= constants.UPDATE_PASSWD_USUARIO;
    const updateValues_passwd= [username, newPassword];

    const client = await pool.connect();
    try {
        //check if username exits
        const selectResult = await client.query(selectQuery, selectValues);

        if (selectResult.rows.length > 0) { //username exits
            //check if oldPasswd is correct
            if(selectResult.rows[0].passwd === oldPassword){ //correct oldPasswd
                
                //update values
                const updatetResult = await client.query(updateQuery_passwd, updateValues_passwd);
                //return exito and sucessful msg
                return {exito: true, msg: constants.CORRECT_CHANGE_PASSWD};

            }else return {exito: false, msg: constants.WRONG_PASSWD}; //incorrect oldPasswd  //return error and error msg : wrong passwd

        } else return {exito: false , msg: constants.WRONG_USER};  //username doesnt exist //return error and error msg : user doesnt exist

    } catch (error) {
        throw error;
    } finally {
        client.release();
    }

}

//*****************************************CHAT*********************************************** */
//return exito and msg
async function saveMsg(currentTimestamp,group, isQ, msg,emisor) { //falta meter isQ


    const insertQuery= constants.INSERT_CONVERSACION;
    const insertValues = [currentTimestamp,isQ,group,msg,emisor];

    const client = await pool.connect();
    try {
        // Realizar la consulta SELECT para verificar si la dirección ya existe
        const insertResult = await client.query(insertQuery, insertValues);

        if(insertResult.rows.length == 0){
            //usuario no existe
            return {exito: false, msg: constants.WRONG_MSG};
        } else {
            //login correcto
            return {exito: true, msg:constants.CORRECT_MSG };
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

//return exito and  if error -> msg else -> mensajes
async function restoreMsg(currentTimestamp,group) {

    const selectQuery= constants.SELECT_ALL_CONVERSACION;
    const selectValues = [currentTimestamp,group];

    const client = await pool.connect();
    try {
        const selectResult = await client.query(selectQuery, selectValues);

        if(selectResult.rows.length == 0){
            return { exito: false, msg: constants.WRONG_LDR_MSG };
        } else {
            const mensajes = selectResult.rows.map(row => ({
                mensaje: row.contenido,
                emisor: row.emisor,
                esPregunta: row.isQuestion,
                instante: row.instante
            }));
            return { exito: true, mensajes: mensajes };
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

async function getDefaultQuestions(id) {}

//*****************************************JUGADOR******************************************** */
//return exito and  if error -> msg else -> id_partida
async function gameExists(username) { //user hasnt started a play

    //DUDA: no sé si devolver false si existe o si no existe
    // si no existe el user --> false
    // si esta jugando una partida --> true
    // si no esta jugando ninguna partida --> false

    // check if user exits and has an active game
    const selectQuery= constants.SELECT_PARTIDAandSTATE_JUGADOR;
    const selectValues = [username];

    const client = await pool.connect();
    try {
        const selectResult = await client.query(selectQuery, selectValues);

        if(selectResult.rows.length == 0){ //username doesnt exist
            return {exito: false, msg: constants.WRONG_USER};
        } else if( selectResult.rows[0].estado != constants.STOP) {// user is playing
            return {exito: true, id_partida:selectResult.rows[0].partida};
        }else{ //user can start a new play
            return {exito: true};
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
    
    
} 

//return exito and if error -> msg else -> id_partida
async function createGame(username,type){
    
    var exito = false;
    do {
        const enteroSeisDigitos = generarEnteroSeisDigitos();
        const selectQuery = SELECT_ID_PARTIDA;
        const selectValues = [enteroSeisDigitos];
    
        const client = await pool.connect();
        try {
            //check if this id already exists
            const selectResult = await client.query(selectQuery, selectValues);
            
            if(selectResult.rows.length == 0){ // id doesnt exist

                //get solution cards
                const asesino = getAsesino();
                const arma = getArma();
                const lugar = getLugar();
                const date = getCurrentDate();


                // try to insert into partida
                const insertQuery_partida  = constants.INSERT_PARTIDA;
                const insertValues_partida = [enteroSeisDigitos, constants.PLAY, date , null, type, null, asesino, arma, lugar];  

                const insertResult_partida = await client.query(insertQuery_partida, insertValues_partida);

                //insert_error
                if(insertResult_partida.rows.length == 0) return { exito: exito , msg: constants.ERROR_INSERTING }
                else{
                    const id_partida =  insertResult_partida.rows[0].id_partida ;
                    await joinGame(username,id_partida);
                }
                return { exito: exito, id_partida: id_partida };

            }
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }

    }while(!exito);
    
} 

async function joinGame(username,idGame){
    
    const updateQuery_jugador  = constants.UPDATE_PARTIDAandSTATE_JUGADOR;
    const updateValues_jugador = [idGame,username, constants.PLAY];  
    
    const updateResult = await client.query(updateQuery_jugador, updateValues_jugador); 
    
    //update_error
    if(updateResult.rows.length == 0) return { exito: exito , msg: constants.ERROR_UPDATING }
    else{
        exito = true;
        return { exito: exito, id_partida: idGame };
    } 
}

// post: return availability of characters in the current game
// vector which has null at the index of the character that is available
// otherwise it has the index of the user that has the character
// ---------------------------------------------------------------------
// [null, null, null, null, null, null] -> all characters are available
// [mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA]
// ---------------------------------------------------------------------
async function availabilityCharacters(idGame) {

    const selectQuery= constants.SELECT_FICHA_JUGADOR;
    const selectValues = [idGame];

    const client = await pool.connect();
    try {
        const selectResult = await client.query(selectQuery, selectValues);

        if(selectResult.rows.length == 0){
            return { exito: false, msg: constants.WRONG_IDGAME};
        } else {
            let availability = [];
            availability.length = 6;
            availability.fill(null);
            let relation = {
                [constants.SOPER]: 0,
                [constants.REDES]: 1,
                [constants.PROG]: 2,
                [constants.FISICA]: 3,
                [constants.DISCRETO]: 4,
                [constants.IA]: 5
            }
            for (let i = 0; i < selectResult.rows.length; i++) {
                availability[relation[selectResult.rows[i].ficha]] = relation[selectResult.rows[i].userName];
            }
            return availability; // return the updated availability array

        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

//pre: character is available
//post: character is assigned to the user
async function selectCharacter(username, character) {
    
        const updateQuery_jugador  = constants.UPDATE_FICHA_JUGADOR;
        const updateValues_jugador = [username, character];  
        
        const client = await pool.connect();
        try {
            const updateResult = await client.query(updateQuery_jugador, updateValues_jugador); 
    
            if(updateResult.rows.length == 0) return { exito: false , msg: constants.ERROR_UPDATING }
            else return { exito: true, msg: constants.CORRECT_UPDATE};
    
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
}

async function leftGame(username){ 
    const updateQuery_jugador  = constants.UPDATE_PARTIDAandSTATEandCHAR_JUGADOR;
    const updateValues_jugador = [null,username, constants.STOP, null];  
    
    const client = await pool.connect();
    try {
        const updateResult = await client.query(updateQuery_jugador, updateValues_jugador); 

        if(updateResult.rows.length == 0) return { exito: false , msg: constants.ERROR_UPDATING }
        else return { exito: true, msg: constants.CORRECT_UPDATE};

    } catch (error) {
        throw error;
    } finally {
        client.release();
    }

}

async function stopGame(id_partida){
    
    // check if user exits and has an active game
    const updatePartidaQuery= constants.UPDATE_STATE_PARTIDA;
    //supnogo  que update tb el estado de los playerssss
    const updatePartidaValues = [id_partida, constants.PAUSE];
    
    
    const client = await pool.connect();
    try {
        const updatePartidaResult = await client.query(updatePartidaQuery, updatePartidaValues);

        if(updatePartidaResult.rows.length==0) return {exito: false, msg: constants.ERROR_UPDATING};
        else return {exito: true}

    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

async function finishGame(id_partida){
    const deleteChatsaQuery= constants.DELETE_GAME_CONVERSACION;
    const deleteChatsValues = [id_partida];
    
    const client = await pool.connect();
    try {
        const updatePartidaResult = await client.query(deleteChatsaQuery, deleteChatsValues);

        if(updatePartidaResult.rows.length==0) {
            const updateStateandPartidaQuery= constants.UPDATE_STATEandPARTIDA_P_JUGADOR;
            const updateStateandPartidaValues = [id_partida, constants.STOP, 0];

            const deletePartidaQuery= constants.DELETE_ALL_PARTIDA;
            const deletePartidaValues = [id_partida];


            await client.query(updateStateandPartidaQuery, updateStateandPartidaValues);
            await client.query(deletePartidaQuery, deletePartidaValues);

            //HAY QUE BORRAR TB LAS TABLAS DE RELACION CARTAS Y JUGADOR

            return {exito: true, msg: constants.CORRECT_DELETE };
        }else return {exito: false, msg: constants.ERROR_DELETING }

    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}


async function getPlayersCharacter(id_partida) {

    //get player where partida=id_partida
    const selectQuery= constants.SELECT_FICHA_JUGADOR;
    const selectValues = [id_partida];

    const client = await pool.connect();
    try {
        const selectResult = await client.query(selectQuery, selectValues);

        if(selectResult.rows.length == 0){
            return { exito: false, msg: constants.WRONG_USER};
        } else {
            return { exito: true, nombre: selectResult.rows[0].nombre};
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}


async function playerInformation(jugador) {} // informacion como xp || partidas_ganadasç

async function getPlayerXP(username) {

    const selectQuery= constants.SELECT_XP_USUARIO;
    const selectValues = [username];

    const client = await pool.connect();
    try {
        const selectResult = await client.query(selectQuery, selectValues);

        if(selectResult.rows.length == 0){
            return { exito: false, msg: constants.WRONG_USER};
        } else {
            return { exito: true, XP: selectResult.rows[0].XPs};
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
} // informacion como xp || partidas_ganadas

async function getSuspicions(jugador) {}


//****************************************JUEGO*********************************************** */
async function playerHasCard(jugador,card,idGame) {} //idGame==group
async function restorePreviousGame(idGame) {}
async function updateTurn(idGame) {



    
} //Faltan parametros aún
async function getTurn(idGame) {}
async function resolve(jugador, idGame, characterCard, weaponCard, placeCard) {} // incluye actualizacion XP
async function getType(idGame) {}





//********************************************AUX********************************************* */

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
    var fechaFormateada = año + '-' + mes + '-' + dia;

    // Mostrar la fecha formateada
    //console.log(fechaFormateada);
    return fechaFormateada;
}

async function getAsesino(){

    const determinar_asesino = constants.SELECT_NOMBRE_ASESINO;
    
    const client = await pool.connect();
    try {
        const selectResult = await client.query(determinar_asesino);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return { exito: false, msg: constants.ERROR_ASESINO };
        } else {
            return  selectResult.rows[0].nombre;
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

async function getArma(){

    const determinar_asesino = constants.SELECT_NOMBRE_ARMA;
    
    const client = await pool.connect();
    try {
        const selectResult = await client.query(determinar_asesino);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return { exito: false, msg: constants.ERROR_ARMA };
        } else {
            return  selectResult.rows[0].nombre;
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

async function getLugar(){

    const determinar_asesino = constants.constants.SELECT_NOMBRE_LUGAR;
    
    const client = await pool.connect();
    try {
        const selectResult = await client.query(determinar_asesino);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return { exito: false, msg: constants.ERROR_LUGAR };
        } else {
            return  selectResult.rows[0].nombre;
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

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
    availabilityCharacters,
    selectCharacter,
    stopGame,
    finishGame,
//****************************************JUGADOR*********************************************** */
    playerInformation,
    getPlayerXP
};