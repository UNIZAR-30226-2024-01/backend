const SOPER = 'mr SOPER';
const REDES = 'miss REDES';
const PROG = 'mr PROG';
const FISICA = 'miss FISICA';
const DISCRETO = 'mr DISCRETO';
const IA = 'miss IA';
const CHARACTERS_NAMES = [
  SOPER,
  REDES,
  PROG,
  FISICA,
  DISCRETO,
  IA,
];

const GUNS_NAMES = [
  'teclado',
  'cable de red', //db: asfixiaCableRed
  'cafe envenenado', //db: cafeEnvenenado
  'router afilado', //db: routerAfilado
  'troyano',
  'cd', //db: lanzar cd
];

const ROOMS_NAMES = [
  'cafeteria',
  'baños',
  'recepcion',
  'escaleras',
  'biblioteca',
  'laboratorio',
  'despacho',
  'aulas norte',
  'aulas sur',
];

const TYPES_CARD = [
  'personaje',
  'arma',
  'lugar'
];

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
    'https://h15hf16d-5173.uks1.devtunnels.ms',
  ],

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
  CHARACTERS_NAMES,
  SOPER,
  REDES,
  PROG,
  FISICA,
  DISCRETO,
  IA,

  //Armas
  GUNS_NAMES,

  //Habitaciones
  ROOMS_NAMES,

  //Tipos de cartas
  TYPES_CARD,

  NUM_PLAYERS: CHARACTERS_NAMES.length,
  NUM_CARDS: (CHARACTERS_NAMES.length + GUNS_NAMES.length + ROOMS_NAMES.length) - 3 / CHARACTERS_NAMES.length ,
  
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
    'INSERT INTO grace_hopper."cartas_jugador" ("jugador", "carta") VALUES ($1, $2) RETURNING "jugador"',

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
  SELECT_NOMBRE_TYPE:
    'SELECT nombre FROM grace_hopper."cartas" WHERE tipo=$2 ORDER BY RANDOM() LIMIT 1',
  SELECT_NOMBRE_ASESINO:
    'SELECT nombre FROM grace_hopper."personajes" ORDER BY RANDOM() LIMIT 1',
  SELECT_NOMBRE_ARMA:
    'SELECT nombre FROM grace_hopper."arma" ORDER BY RANDOM() LIMIT 1',
  SELECT_NOMBRE_LUGAR:
    'SELECT nombre FROM grace_hopper."lugar" ORDER BY RANDOM() LIMIT 1',
  SELECT_FICHA_JUGADOR:
    'SELECT ficha, "userName" FROM grace_hopper."jugador" WHERE partida_actual = $1',
  SELECT_USERNAME_JUGADOR:
    'SELECT "userName" FROM grace_hopper."jugador" WHERE partida_actual = $1 AND ficha = $2',
  SELECT_CARTAS_JUGADOR: 
    'SELECT carta FROM grace_hopper."cartas_jugador" WHERE "jugador" = $1',
  SELECT_CARTAS_DISTINT_SOLUTION:
  'SELECT ' +
  '  cartas.nombre AS cards ' +
  'FROM ' +
  '  grace_hopper."cartas" cartas ' +
  'JOIN ' +
  '  grace_hopper."partida" game ON cartas.nombre != game.asesino and cartas.nombre != game.arma and cartas.nombre != game.lugar and game.id_partida = $1',
  SELECT_INFO_JUGADOR:
    'SELECT ' +
    '  player.ficha AS ficha, ' +
    '  player.partida_actual AS partida, ' +
    '  player.sospechas AS sospechas, ' +
    '  player.posicion AS posicion, ' +
    '  player.estado AS estado, ' +
    '  user.n_jugadas AS n_jugadas, ' +
    '  user.n_ganadas_local AS n_ganadas_local, ' +
    '  user.n_ganadas_online AS n_ganadas_online, ' +
    '  user."XP" AS XP ' +
    'FROM ' +
    '   grace_hopper."jugador" player ' +
    'JOIN ' +
    '  grace_hopper."usuario" user ON player."userName" = user."userName" ' +
    'WHERE ' +
    ' player."userName" = $1',
  SELECT_SOLUTION:
   'SELECT id_partida FROM grace_hopper."partida" WHERE id_partida = $1'+
   'AND asesino = $2 AND arma = $3 AND lugar = $4',
  SELECT_INFO_GAME:
    'SELECT estado, fecha_ini, tipo, turno FROM grace_hopper."partida" WHERE id_partida = $1',
  SELECT_CARTA_JUGADOR:
    'SELECT carta, jugador FROM grace_hopper."cartas_jugador" WHERE jugador = $1 AND carta = $2',
  SELECT_TURN_PARTIDA:
    'SELECT turno FROM grace_hopper."partida" WHERE id_partida = $1',
  SELECT_DETERMINADAS_CARTAS_JUGADOR:
    'SELECT ' +
    '  cartas.carta AS cartas, ' +
    '  player."userName" AS user ' +
    'FROM ' +
    '   grace_hopper."jugador" player ' +
    'JOIN ' +
    '   grace_hopper."cartas_jugador" cartas ON cartas.carta= $3 OR cartas.carta= $4 OR cartas.carta= $5 ' +
    'WHERE ' +
    ' player.partida_actual = $2 AND player."ficha" = $1',


  //-------update-------;
  UPDATE_PASSWD_USUARIO:
    'UPDATE grace_hopper."usuario" SET  passwd = $2 WHERE "userName" = $1',
  UPDATE_STATE_PARTIDA:
    'UPDATE grace_hopper."partida" SET estado = $2 WHERE id_partida = $1',
  UPDATE_FICHA_JUGADOR:
    'UPDATE grace_hopper."jugador" SET ficha = $2 WHERE "userName" = $1 RETURNING *',
  UPDATE_PARTIDAandSTATE_JUGADOR:
    'UPDATE grace_hopper."jugador" SET  partida_actual = $1, estado = $3 WHERE "userName" = $2',
  UPDATE_PARTIDAandSTATEandCHAR_JUGADOR:
   'UPDATE grace_hopper."jugador" SET  partida_actual = $1, estado = $3, ficha = $4 WHERE "userName" = $2 RETURNING *',
  UPDATE_STATE_JUGADOR:
    'UPDATE grace_hopper."jugador" SET estado = $2 WHERE "userName" = $1',
  UPDATE_STATEandPARTIDA_P_JUGADOR:
    'UPDATE grace_hopper."jugador" SET estado = $2, partida_actual = $3 WHERE partida_actual = $1',
  UPDATE_TURNO_PARTIDA:
    'UPDATE grace_hopper."partida" SET turno = $2 WHERE partida_actual = $1',
  UPDATE_SOSPECHAS_POSITION:
    'UPDATE grace_hopper."jugador" SET sospechas = $2, SET posicion = $3 WHERE "userName" = $1',
  UPDATE_SOSPECHAS:
    'UPDATE grace_hopper."jugador" SET sospechas = $2 WHERE "userName" = $1',

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
  WRONG_ACUSE: 'La acusación no es correcta.',
  CORRECT_LOGIN: 'Se ha iniciado sesión correctamente.',
  CORRECT_CHANGE_PASSWD: 'La constraseña ha sido actualizada con exito.',
  CORRECT_MSG: 'El mensaje se ha almacenado correctamente.',
  CORRECT_DELETE: 'Partida eliminada correctamente.',
  CORRECT_ACUSE: 'Acusación correcta.',
  CORRECT_UPDATE: 'Actualización correcta.',
  CORRECT_INSERT: 'Insercción correcta.',

  //
  ERROR_UPDATING: 'Error al actualizar.',
  ERROR_INSERTING: 'Error al realizar la insercción.',
  ERROR_DELETING: 'Error al eliminar.',
  ERROR_ASESINO: 'No se ha obtenido ningun asesino.',
  ERROR_ARMA: 'No se ha obtenido ningun arma.',
  ERROR_LUGAR: 'No se ha obtenido ningun lugar.',
};
