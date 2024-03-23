module.exports = {

//CHARACTERS
    PAUSE: 'p',
    STOP: '0',
    PLAY: '1',


    //Módulo.src
    WRONG_PASSWD: "La contraseña introducida es incorrecta.",
    WRONG_USER:"El usuario introducido es incorrecto.",
    WRONG_MSG: "El mensaje no se ha almacenado correctamente.",
    WRONG_LDR_MSG: "No se han restaurado mensajes",
    CORRECT_LOGIN: "Se ha iniciado sesión correctamente.",
    CORRECT_CHANGE_PASSWD: "La constraseña ha sido actualizada con exito.",
    CORRECT_MSG: "El mensaje se ha almacenado correctamente.",
    ERROR_UPDATING: "Error al actualizar.",
    ERROR_INSERTING: "Error al realizar la insercción.",



    //Múdlo.src__Querys
    //-------insert-------
    INSERT_JUGADOR: 'INSERT INTO grace_hopper."jugador" ("userName", ficha, partida_actual, sospechas, posicion, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING "userName"',
    INSERT_USUARIO: 'INSERT INTO grace_hopper."usuario" ("userName", passwd, "XP", n_ganadas_online, n_ganadas_local, n_jugadas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING "userName"',
    INSERT_CONVERSACION: 'INSERT INTO grace_hopper."conversacion" (instante, "isQuestion", partida, contenido, emisor) VALUES ($1, $2, $3, $4, $5) RETURNING emisor',
    INSERT_PARTIDA: 'INSERT INTO grace_hopper."partida" (id_partida, estado, fecha_ini, fecha_fin, tipo, turno , asesino, arma , lugar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_partida',


    //-------select-------
    SELECT_USER_USUARIO: 'SELECT "userName" FROM grace_hopper."usuario" WHERE "userName" = $1',
    SELECT_PASSWD_USUARIO:  'SELECT passwd FROM grace_hopper."usuario" WHERE "userName" = $1',
    SELECT_ALL_CONVERSACION:  'SELECT contenido,emisor,"isQuestion",instante FROM grace_hopper."conversacion" WHERE  instante <= $1 AND partida = $2 ORDER BY instante',
    SELECT_PARTIDAandSTATE_JUGADOR:  'SELECT partida, estado FROM grace_hopper."jugador" WHERE "userName" = $1',
    SELECT_ID_PARTIDA: 'SELECT id_partida FROM grace_hopper."partida" WHERE id_partida = $1',


    //-------update-------;
    UPDATE_PASSWD_USUARIO:  'UPDATE grace_hopper."usuario" SET  passwd = $2 WHERE "userName" = $1',
    UPDATE_PARTIDAandSTATE_JUGADOR:  'UPDATE grace_hopper."jugador" SET  partida = $1 AND estado = $3 WHERE "userName" = $2',
    UPDATE_STATE_PARTIDA:  'UPDATE grace_hopper."partida" SET estado = $2 WHERE id_partida = $1',
    UPDATE_STATE_JUGADOR: 'UPDATE grace_hopper."jugador" SET estado = $2 WHERE "userName" = $1',


};