const pool = require('./connectionManager');


//**************************************LOGIN************************************************* */
async function createAccount(username, password) {

    const selectQuery = 'SELECT "userName" FROM grace_hopper."usuario" WHERE "userName" = $1';
    const selectValues = [username];
    
    const insertQuery_jugador= 'INSERT INTO grace_hopper."jugador" ("userName", ficha, partida_actual, sospechas, posicion, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING "userName"';
    const insertValues_jugador= [username, null, null,null,null,0];

    const insertQuery_user= 'INSERT INTO grace_hopper."usuario" ("userName", passwd, "XP", n_ganadas_online, n_ganadas_local, n_jugadas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING "userName"';
    const insertValues_user = [username, password, 0,0,0,0];


    const client = await pool.connect();
    try {
        // Realizar la consulta SELECT para verificar si la dirección ya existe
        const selectResult = await client.query(selectQuery, selectValues);

        if (selectResult.rows.length > 0) {
            //si ya existe, devolver el ID existente
            //return {exito: true};
            return {exito: true, username: selectResult.rows[0].userName};
        } else {
            //no existe, realizar la inserción
            const insertResult_jugador = await client.query(insertQuery_jugador, insertValues_jugador);
            const insertResult_user = await client.query(insertQuery_user, insertValues_user);
            //return {exito: true};
            return {exito: true, username: insertResult_user.rows[0].userName};
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

async function login(username, password) {

    const selectQuery = 'SELECT passwd FROM grace_hopper."usuario" WHERE "userName" = $1';
    const selectValues = [username];

    const client = await pool.connect();
    try {
        // Realizar la consulta SELECT para verificar si la dirección ya existe
        const selectResult = await client.query(selectQuery, selectValues);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return {exito: false, msg: "Usuario incorrecto."};
        }else if (selectResult.rows[0].passwd != password ) {
            //constraseña incorrecta
            return {exito: false, msg: "Password incorrecta."};
        } else {
            //login correcto
            return {exito: true, msg: "Password correcta."};
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

async function changePassword(id) {}

//*****************************************CHAT*********************************************** */
async function saveMsg(currentTimestamp,group, isQ, msg,emisor) { //falta meter isQ

    const insertQuery= 'INSERT INTO grace_hopper."conversacion" (instante, "isQuestion", partida, contenido, emisor) VALUES ($1, $2, $3, $4, $5) RETURNING emisor';
    //isQ falta tratarlo bn
    const insertValues = [currentTimestamp,isQ,group,msg,emisor];

    const client = await pool.connect();
    try {
        // Realizar la consulta SELECT para verificar si la dirección ya existe
        const insertResult = await client.query(insertQuery, insertValues);

        if(insertResult.rows.length == 0){
            //usuario no existe
            return {exito: false, msg: "Error al almacenar el mensaje."};
        } else {
            //login correcto
            return {exito: true, msg: "Mensaje alamacenado correctamente."};
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

async function restoreMsg(group) {

    const selectQuery= 'SELECT contenido,emisor,"isQuestion",instante FROM grace_hopper."conversacion" WHERE  partida = $1';
    const selectValues = [group];

    const client = await pool.connect();
    try {
        // Realizar la consulta SELECT para verificar si la dirección ya existe
        const selectResult = await client.query(selectQuery, selectValues);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return { exito: false, msg: "No se encontraron mensajes." };
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
async function gameExists(jugador) {} //jugador ya pertenece a una partida
async function playerInformation(jugador) {} // informacion como xp || partidas_ganadas
async function getSuspicions(jugador) {}


//****************************************JUEGO*********************************************** */
async function playerHasCard(jugador,card,idGame) {} //idGame==group
async function restorePreviousGame(idGame) {}
async function updateTurn() {} //Faltan parametros aún
async function getTurn(idGame) {}
async function resolve(jugador, idGame, characterCard, weaponCard, placeCard) {} // incluye actualizacion XP
async function getType(idGame) {}




module.exports = {
    createAccount,
    login,
    saveMsg,
    restoreMsg
};