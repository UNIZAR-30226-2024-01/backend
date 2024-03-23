
//CHARACTERS
export const PAUSE = 'p';
export const STOP = '0';
export const PLAY = '1';


//Módulo.src
export const WRONG_PASSWD = "La contraseña introducida es incorrecta.";
export const WRONG_USER = "El usuario introducido es incorrecto.";
export const WRONG_MSG = "El mensaje no se ha almacenado correctamente.";
export const WRONG_LDR_MSG = "No se han restaurado mensajes";
export const CORRECT_LOGIN = "Se ha iniciado sesión correctamente.";
export const CORRECT_CHANGE_PASSWD = "La constraseña ha sido actualizada con exito.";
export const CORRECT_MSG = "El mensaje se ha almacenado correctamente.";
export const ERROR_UPDATING = "Error al actualizar.";
export const ERROR_INSERTING = "Error al realizar la insercción.";



//Múdlo.src__Querys
//-------insert-------
export const INSERT_JUGADOR = 'INSERT INTO grace_hopper."jugador" ("userName", ficha, partida_actual, sospechas, posicion, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING "userName"';
export const INSERT_USUARIO = 'INSERT INTO grace_hopper."usuario" ("userName", passwd, "XP", n_ganadas_online, n_ganadas_local, n_jugadas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING "userName"';
export const INSERT_CONVERSACION = 'INSERT INTO grace_hopper."conversacion" (instante, "isQuestion", partida, contenido, emisor) VALUES ($1, $2, $3, $4, $5) RETURNING emisor';
export const INSERT_PARTIDA = 'INSERT INTO grace_hopper."partida" (id_partida, estado, fecha_ini, fecha_fin, tipo, turno , asesino, arma , lugar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_partida';


//-------select-------
export const SELECT_USER_USUARIO = 'SELECT "userName" FROM grace_hopper."usuario" WHERE "userName" = $1';
export const SELECT_PASSWD_USUARIO =  'SELECT passwd FROM grace_hopper."usuario" WHERE "userName" = $1'
export const SELECT_ALL_CONVERSACION =  'SELECT contenido,emisor,"isQuestion",instante FROM grace_hopper."conversacion" WHERE  instante <= $1 AND partida = $2 ORDER BY instante';
export const SELECT_PARTIDAandSTATE_JUGADOR =  'SELECT partida, estado FROM grace_hopper."jugador" WHERE "userName" = $1';
export const SELECT_ID_PARTIDA =  'SELECT id_partida FROM grace_hopper."partida" WHERE id_partida = $1';


//-------update-------;
export const UPDATE_PASSWD_USUARIO =  'UPDATE grace_hopper."usuario" SET  passwd = $2 WHERE "userName" = $1'
export const UPDATE_PARTIDAandSTATE_JUGADOR =  'UPDATE grace_hopper."jugador" SET  partida = $1 AND estado = $3 WHERE "userName" = $2';
export const UPDATE_STATE_JUGADOR =  'UPDATE grace_hopper."jugador" SET estado = $2 WHERE "userName" = $1';
export const UPDATE_STATE_PARTIDA =  'UPDATE grace_hopper."partida" SET estado = $2 WHERE id_partida = $1';


