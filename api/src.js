const pool = require('./connectionManager');


//**************************************LOGIN************************************************* */
export async function createAccount(username, password) {

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

export async function login(username, password) {

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
export async function saveMsg(currentTimestamp,group, isQ, msg,emisor) { //falta meter isQ

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

export async function restoreMsg(currentTimestamp,group) {

    const selectQuery= 'SELECT contenido,emisor,"isQuestion",instante FROM grace_hopper."conversacion" WHERE  instante <= $1 AND partida = $2 ORDER BY instante';
    const selectValues = [currentTimestamp,group];

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
export async function gameExists(jugador) {
    
} //jugador ya pertenece a una partida
export async function createGame(username,type){
    
    var exito = false;
    do{
        const enteroSeisDigitos = generarEnteroSeisDigitos();
        const selectQuery= 'SELECT id_partida FROM grace_hopper."partida" WHERE  id_partida = $1';
        const selectValues = [enteroSeisDigitos];
    
        const client = await pool.connect();
        try {
            // Realizar la consulta SELECT para verificar si ese ID ya existe
            const selectResult = await client.query(selectQuery, selectValues);
    
            if(selectResult.rows.length == 0){
                exito = true;
                
                const asesino = getAsesino();
                const arma = getArma();
                const lugar = getLugar();
                const date = getCurrentDate();


                // se inserta en partida
                const insertQuery_partida= 'INSERT INTO grace_hopper."partida" (id_partida, estado, fecha_ini, fecha_fin, tipo, turno , asesino, arma , lugar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_partida';
                const insertValues_partida= [enteroSeisDigitos, 1, date , null, type, null, asesino, arma, lugar];  

                const insertResult_partida = await client.query(insertQuery_partida, insertValues_partida);

                const id_partida =  insertResult_partida.rows[0].id_partida ;

                const insertQuery_jugador= 'UPDATE grace_hopper."jugador" SET  partida_actual = $1 WHERE "userName" = $2';
                const insertValues_jugador= [id_partida,username];  
        
                await client.query(insertQuery_jugador, insertValues_jugador);

                return { exito: false, id:id_partida };
            } 
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }

    }while(!exito);
    
} // 

export async function stopGame(){}

export async function finishGame(){}


export async function playerInformation(jugador) {} // informacion como xp || partidas_ganadasç

export async function getPlayerXP(jugador) {

    const selectQuery= 'SELECT "XP FROM grace_hopper."usuario" WHERE  "userName" = $1';
    const selectValues = [jugador];

    const client = await pool.connect();
    try {
        // Realizar la consulta SELECT para verificar si la dirección ya existe
        const selectResult = await client.query(selectQuery, selectValues);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return { exito: false, msg: "No se ha encontrado ningun emisor." };
        } else {
            return { exito: true, XP: selectResult.rows[0].XPs };
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
async function updateTurn() {} //Faltan parametros aún
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

    const determinar_asesino = 'SELECT nombre FROM grace_hopper."personajes" ORDER BY RANDOM() LIMIT 1';
    
    const client = await pool.connect();
    try {
        const selectResult = await client.query(determinar_asesino);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return { exito: false, msg: "No se ha obtenido ningun asesino" };
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

    const determinar_asesino = 'SELECT nombre FROM grace_hopper."arma" ORDER BY RANDOM() LIMIT 1';
    
    const client = await pool.connect();
    try {
        const selectResult = await client.query(determinar_asesino);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return { exito: false, msg: "No se ha obtenido ningun arma" };
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

    const determinar_asesino = 'SELECT nombre FROM grace_hopper."lugar" ORDER BY RANDOM() LIMIT 1';
    
    const client = await pool.connect();
    try {
        const selectResult = await client.query(determinar_asesino);

        if(selectResult.rows.length == 0){
            //usuario no existe
            return { exito: false, msg: "No se ha obtenido ningun lugar" };
        } else {
            return  selectResult.rows[0].nombre;
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}
