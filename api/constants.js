module.exports = {
  //Módulo.index
  //
  PORT: 3000,
  SERVER_TXT: 'Server is running on port',
  //

  PRODUCTION_IPS: [
    'http://51.20.246.74',
    'http://ec2-51-20-246-74.eu-north-1.compute.amazonaws.com',
  ],
  DEVELOPMENT_IPS: [
    'http://localhost:5173',
    'http://10.1.64.155:5173',
    'http://localhost:4200',
  ],
  //

  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  CHAT_MESSAGE: 'chat-message',
  CHAT_RESPONSE: 'chat-response',
  CHAT_TURN: 'chat turn',
  USER_CONNECTED: 'A user has connected.',
  USER_DISCONNECTED: 'A user has disconnected.',
  CONNECTED_DB: 'Connected to the database',
  DISCONNECTED_DB: 'Disconnected from PostgreSQL server',

  //
  ERROR_STORE_MSG: 'Error al almacenar el mensaje.',
  ERROR_LOAD_MSG: 'Error al cargar mensaje.',
  ERROR_DATA_BASE: 'Error connecting to the database:',
  ERROR_LOGIN: 'Error en el servidor al realizar el inicio de sesión',
  ERROR_XP: 'Error en el servidor al obtener XP',

  //
  ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ALLOW_METHODS: 'Access-Control-Allow-Methods',
  ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  METHODS: 'GET, POST, PUT, DELETE',
  HEADERS: 'Content-Type',
  SIGINT: 'SIGINT',

  //
  PAUSE: 'p',
  STOP: '0',
  PLAY: '1',
  CERO: '0',
  MENOS: '-',
  MAS: '+',

  //Personajes
  CHARACTERS_NAMES: [
    'mr SOPER',
    'miss REDES',
    'mr PROG',
    'miss FISICA',
    'mr DISCRETO',
    'miss IA',
  ],

  //Armas
  GUNS_NAMES: [
    'teclado',
    'cable de red',
    'café envenenado',
    'router afilado',
    'troyano',
    'cd',
  ],

  //Habitaciones
  ROOMS_NAMES: [
    'cafeteria',
    'baños',
    'recepcion',
    'escaleras',
    'biblioteca',
    'laboratorio',
    'despacho',
    'aulas norte',
    'aulas sur',
  ],

  NUM_PLAYERS: 6,
  NUM_CARDS: 3,
  
  //Módulo.controller
  WRONG_PASSWD: 'La contraseña introducida es incorrecta.',
  WRONG_USER: 'El usuario introducido es incorrecto.',
  WRONG_MSG: 'El mensaje no se ha almacenado correctamente.',
  WRONG_LDR_MSG: 'No se han restaurado mensajes',
  CORRECT_LOGIN: 'Se ha iniciado sesión correctamente.',
  CORRECT_CHANGE_PASSWD: 'La constraseña ha sido actualizada con exito.',
  CORRECT_MSG: 'El mensaje se ha almacenado correctamente.',
  CORRECT_DELETE: 'Partida eliminada correctamente.',

  //
  ERROR_UPDATING: 'Error al actualizar.',
  ERROR_INSERTING: 'Error al realizar la insercción.',
  ERROR_DELETING: 'Error al eliminar.',
  ERROR_ASESINO: 'No se ha obtenido ningun asesino.',
  ERROR_ARMA: 'No se ha obtenido ningun arma.',
  ERROR_LUGAR: 'No se ha obtenido ningun lugar.',

  //Múdlo.controller__Querys
  //-------insert-------
  INSERT_JUGADOR:
    'INSERT INTO grace_hopper."jugador" ("userName", ficha, partida_actual, sospechas, posicion, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING "userName"',
  INSERT_USUARIO:
    'INSERT INTO grace_hopper."usuario" ("userName", passwd, "XP", n_ganadas_online, n_ganadas_local, n_jugadas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING "userName"',
  INSERT_CONVERSACION:
    'INSERT INTO grace_hopper."conversacion" (instante, "isQuestion", partida, contenido, emisor) VALUES ($1, $2, $3, $4, $5) RETURNING emisor',
  INSERT_PARTIDA:
    'INSERT INTO grace_hopper."partida" (id_partida, estado, fecha_ini, fecha_fin, tipo, turno , asesino, arma , lugar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_partida',
  INSERT_CARTAS_JUGADOR:
    'INSERT INTO grace_hopper."cartas_jugador" ("nombre", "jugador") VALUES ($1, $2) RETURNING "jugador"',

  //-------select-------
  SELECT_USER_USUARIO:
    'SELECT "userName" FROM grace_hopper."usuario" WHERE "userName" = $1',
  SELECT_PASSWD_USUARIO:
    'SELECT passwd FROM grace_hopper."usuario" WHERE "userName" = $1',
  SELECT_XP_USUARIO:
    'SELECT "XP" FROM grace_hopper."usuario" WHERE "userName" = $1',
  SELECT_ALL_CONVERSACION:
    'SELECT contenido,emisor,"isQuestion",instante FROM grace_hopper."conversacion" WHERE  instante <= $1 AND partida = $2 ORDER BY instante',
  SELECT_PARTIDAandSTATE_JUGADOR:
    'SELECT partida, estado FROM grace_hopper."jugador" WHERE "userName" = $1',
  SELECT_ID_PARTIDA:
    'SELECT id_partida FROM grace_hopper."partida" WHERE id_partida = $1',
  SELECT_NOMBRE_ASESINO:
    'SELECT nombre FROM grace_hopper."personajes" ORDER BY RANDOM() LIMIT 1',
  SELECT_NOMBRE_ARMA:
    'SELECT nombre FROM grace_hopper."arma" ORDER BY RANDOM() LIMIT 1',
  SELECT_NOMBRE_LUGAR:
    'SELECT nombre FROM grace_hopper."lugar" ORDER BY RANDOM() LIMIT 1',
  SELECT_FICHA_JUGADOR:
    'SELECT ficha, "userName" FROM grace_hopper."jugador" WHERE partida_actual = $1',
  SELECT_CARTAS_JUGADOR: 
   'SELECT' +
   '  carta ' +
   'FROM ' +
   ' grace_hopper."cartas_jugador" caj ' +
    'WHERE ' +
   ' caj."jugador" = $1',
  SELECT_CARTAS_DISTINT_SOLUTION:
  'SELECT ' +
  '  p.nombre AS nombre_personaje, ' +
  '  a.nombre AS nombre_arma, ' +
  '  l.nombre AS nombre_lugar, ' +
  '  game.asesino, ' +
  '  game.arma, ' +
  '  game.lugar ' +
  'FROM ' +
  '   grace_hopper."partida" game ' +
  'JOIN ' +
  '  grace_hopper."personajes" p ON p.nombre != game.asesino ' +
  'JOIN ' +
  '  grace_hopper."arma" a ON a.nombre != game.arma ' +
  'JOIN ' +
  '  grace_hopper."lugar" l ON l.nombre != game.lugar' +
  'WHERE ' +
  ' game.id_partida = $1',

  //-------update-------;
  UPDATE_PASSWD_USUARIO:
    'UPDATE grace_hopper."usuario" SET  passwd = $2 WHERE "userName" = $1',
  UPDATE_STATE_PARTIDA:
    'UPDATE grace_hopper."partida" SET estado = $2 WHERE id_partida = $1',
  UPDATE_FICHA_JUGADOR:
    'UPDATE grace_hopper."jugador" SET ficha = $2 WHERE "userName" = $1',
  UPDATE_PARTIDAandSTATE_JUGADOR:
    'UPDATE grace_hopper."jugador" SET  partida_actual = $1 AND estado = $3 WHERE "userName" = $2',
  UPDATE_PARTIDAandSTATEandCHAR_JUGADOR:
    'UPDATE grace_hopper."jugador" SET  partida_actual = $1, estado = $3, ficha = $4 WHERE "userName" = $2',
  UPDATE_STATE_JUGADOR:
    'UPDATE grace_hopper."jugador" SET estado = $2 WHERE "userName" = $1',
  UPDATE_STATEandPARTIDA_P_JUGADOR:
    'UPDATE grace_hopper."jugador" SET estado = $2 AND partida_actual = $3 WHERE partida_actual = $1',

  //-------delete------
  DELETE_GAME_CONVERSACION:
    'DELETE FROM grace_hopper."conversacion" WHERE "partida" = $1',
  DELETE_ALL_PARTIDA:
    'DELETE FROM grace_hopper."partida" WHERE id_partida = $1',
  DELETE_ALL_CARDS_FROM_JUGADOR:
    'DELETE FROM grace_hopper."cartas_jugador" WHERE jugador = $1',

  //Módulo.controller
  WRONG_PASSWD: 'La contraseña introducida es incorrecta.',
  WRONG_USER: 'El usuario introducido es incorrecto.',
  WRONG_IDGAME: 'La partida introducida no existe.',
  WRONG_MSG: 'El mensaje no se ha almacenado correctamente.',
  WRONG_LDR_MSG: 'No se han restaurado mensajes',
  CORRECT_LOGIN: 'Se ha iniciado sesión correctamente.',
  CORRECT_CHANGE_PASSWD: 'La constraseña ha sido actualizada con exito.',
  CORRECT_MSG: 'El mensaje se ha almacenado correctamente.',
  CORRECT_DELETE: 'Partida eliminada correctamente.',

  //
  ERROR_UPDATING: 'Error al actualizar.',
  ERROR_INSERTING: 'Error al realizar la insercción.',
  ERROR_DELETING: 'Error al eliminar.',
  ERROR_ASESINO: 'No se ha obtenido ningun asesino.',
  ERROR_ARMA: 'No se ha obtenido ningun arma.',
  ERROR_LUGAR: 'No se ha obtenido ningun lugar.',
};
