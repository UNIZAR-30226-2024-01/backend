const pool = require('./connectionManager');

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
            return {exito: true, username: insertResult.rows[0].userName};
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


module.exports = {
    createAccount,
    login
};