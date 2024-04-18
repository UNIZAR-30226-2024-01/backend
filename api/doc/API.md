# DEFINICIÓN DE LA API

## 1) Peticiones HTTP

### POST
#### <u>/createAccount:</u>
- **Descripción:** Crea una nueva cuenta de usuario si el nombre de usuario no existe.
- **Body:** 
  - *username*: nombre de usuario.
  - *password*: contraseña.
- **Respuesta:** 
  - *success*: true si se ha creado la cuenta, false si ya existe una cuenta con ese nombre de usuario.
  - *message*: mensaje de si ha podido o no crear la cuenta.

#### <u>/login: </u>
- **Descripción:** Inicia sesión en una cuenta de usuario si el nombre de usuario y la contraseña son correctos.
- **Body:** 
  - *username*: nombre de usuario.
  - *password*: contraseña.
- **Respuesta:**
    - *exito*: true si se ha iniciado sesión, false si no se ha podido iniciar sesión.
    - *message*: mensaje de si ha podido o no iniciar sesión.

#### <u>/createGame:</u>
- **Descripción:** Crea una nueva partida.
- **Body:** 
  - *username*: nombre de usuario.
  - *type*: tipo de partida creada: 'l' si es una partida local, 'o' si es online.
- **Respuesta:**
    - *success*: true si se ha creado la partida, false si no se ha podido crear la partida.
    - si *success* es true:
        - *idGame*: id de la partida creada (dígito de 6 cifras).
    - *message*: mensaje de si ha podido o no crear la partida.

### GET 
#### <u>/obtainXP:</u>
- **Descripción:** Obtiene la experiencia de un usuario.
- **Body**:
    - *username*: nombre de usuario.
- **Respuesta:**
    - *success*: true si existe el usuario y se ha obtenido la experiencia, false si no existe el usuario.
    - si *success* es true:
        - *xp*: experiencia del usuario.
    - si no:
        - *message*: mensaje explicativo del resultado de la petición.

#### <u>/availableCharacters:</u>
- **Descripción:** Obtiene los personajes disponibles de una partida determinada.
- **Body:**
    - *idGame*: id de la partida.
- **Respuesta:**
    - *success* : true si se ha obtenido la lista de personajes, false si no se ha podido obtener la lista de personajes.
    - *characters*: lista de personajes disponibles.
    - *message*: mensaje de si ha podido o no obtener la lista de personajes.


### PUT
#### <u>/changePassword:</u>
- **Descripción:** Cambia la contraseña de un usuario.
- **Body:**
    - *username*: nombre de usuario.
    - *oldPassword*: contraseña actual.
    - *newPassword*: nueva contraseña.
- **Respuesta:**
    - *success*: true si se ha cambiado la contraseña, false si no se ha podido cambiar la contraseña (oldPassword erróneo).
    - *message*: mensaje de si ha podido o no cambiar la contraseña.

#### <u>/characterSelected:</u>
- **Descripción:** Selecciona un personaje para un usuario en una partida.
- **Body:**
    - *username*: nombre de usuario.
    - *character*: personaje seleccionado.
- **Respuesta:**
    - *success*: true si se ha seleccionado el personaje, false si no se ha podido seleccionar el personaje.
    - *message*: mensaje de si ha podido o no seleccionar el personaje.

#### <u>/getNameAndCharacter:</u>
- **Descripción:** Obtiene los nombres de usuario y los personajes de una partida.
- **Body:**
    - *idGame*: id de la partida.
- **Respuesta:**
    - *success*: true si se ha obtenido la lista de nombres y personajes, false si no se ha podido obtener la lista de nombres y personajes.
    - *players*: lista de objetos con dos campos: 
        -*userName*: nombres de usuario de jugadores.
        -*character*: personajes asociados a cada uno de los respectivos jugadores.
    - *message*: mensaje de si ha podido o no obtener la lista de nombres y personajes.


### DELETE
NO HAY TODAVÍA (ideas: deleteAccount, deleteGame, ...)

## 2) Eventos Socket.io

#### start-game():

- **Descripción:** Inicia la partida.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:** No recibe datos.
- **Funcionamiento:** El servidor inicia el proceso que controla la maquina de estados del juego.
- **Devuelve:** Nada

---

#### request-game-info():

- **Descripción:** Solicita los personajes disponibles.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:** No recibe datos.
- **Funcionamiento:** El servidor envia la lista de personajes disponibles.
- **Se responde con:** `game-info(names, guns, rooms, available)`

---

#### character-selected(charcter):

- **Descripción:** Un usuario selecciona un personaje.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:**
  - `character`: nombre del personaje seleccionado por el cliente.
- **Funcionamiento:** El servidor envia la lista de personajes disponibles.
- **Se responde con:** `game-info(names, available)`

---

#### game-info(names, available):

- **Descripción:** Lista de personajes disponibles.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `names`: lista de nombres de personajes.
  - `available`: para cada personaje dice que username lo ha seleccionado ya, cadena vacia si no esta seleccionado aun.
- **Funcionamiento:** El cliente actualiza la lista de personajes disponibles.
- **Se responde con:** Nada

---

#### chat-message(msg):

- **Descripción:** Mensaje de chat.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:**
  - `msg`: contenido del mensaje de chat.
- **Funcionamiento:** El servidor reenvia el mensaje a todos los clientes.
- **Se responde con:** `chat-response(msg, emisor, currentTimestamp, date)`

---

#### chat-response(msg, emisor, currentTimestamp, date):

- **Descripción:** Reenvio de mensaje de chat.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `msg`: contenido del mensaje de chat.
  - `emisor`: nombre del usuario que envio el mensaje.
  - `currentTimestamp`: timestamp del mensaje, para actualizar offset del cliente.
  - `date`: fecha y hora del envio de mensaje.
- **Funcionamiento:** El cliente muestra el mensaje en el chat.
- **Se responde con:** Nada

---
