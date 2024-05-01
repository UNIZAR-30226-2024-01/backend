## Mensajes SOCKET.IO

---

#### start-game():

- **Descripción:** Inicia la partida.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:** No recibe datos.
- **Funcionamiento:** El servidor inicia el proceso que controla la maquina de estados del juego.
- **Devuelve:** Nada

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

#### turno-owner(username)

- **Descripción:** Es el turno de un usuario.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username`: nombre del usuario al que le toca el turno.
- **Funcionamiento:** El cliente muestra en pantalla que es el turno de un usuario. Si el usuario que recibe el mensaje es el mismo que el nombre de usuario, se le habilitan los controles para jugar.
- **Se responde con:** Nada

---

#### turno-moves-to-response(username, position)

- **Descripción:** Un usuario se ha movido a una posicion.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username`: nombre del usuario que se ha movido.
  - `position`: posicion a la que se ha movido.
- **Funcionamiento:** El cliente actualiza la posicion del usuario en el tablero.
- **Se responde con:** Nada


---

#### turno-show-cards(username_asking, username_shower, card, character_asked, gun_asked, room_asked)

- **Descripción:** Un usuario ha enseñado una carta a otro jugador.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username_asking`: nombre del usuario que ha pedido la carta.
  - `username_shower`: nombre del usuario que ha enseñado la carta.
  - `card`: carta enseñada.
  - `character_asked`: personaje preguntado.
  - `gun_asked`: arma preguntada.
  - `room_asked`: habitacion preguntada.
- **Funcionamiento:** El cliente muestra la carta enseñada si el usuario que recibe el mensaje es el mismo que `username-asking`, si no muestra el dorso de la carta.


---

#### turno-select-to-show(username_asking, username_shower, character, gun, room)

- **Descripción:** Un usuario debe seleccionar una carta para enseñar a otro jugador.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username_asking`: nombre del usuario que ha pedido la carta.
  - `username_shower`: nombre del usuario que debe enseñar la carta.
  - `character`: personaje preguntado.
  - `gun`: arma preguntada.
  - `room`: habitacion preguntada.
- **Funcionamiento:** El cliente muestra las cartas del usuario que debe enseñar y le permite seleccionar una.
- **Se responde con:** `turno-card-selected(username_asking, username_shower, card)`

---

#### turno-asks-for-response(username_asking, character, gun, room) 

- **Descripción:** Un usuario ha realizado una sospecha.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username_asking`: nombre del usuario que ha realizado la sospecha.
  - `character`: personaje preguntado.
  - `gun`: arma preguntada.
  - `room`: habitacion preguntada.
- **Funcionamiento:** El cliente muestra la sospecha realizada y el usuario que ha realizado la sospecha.

---

#### game-over(username_asking, win)

- **Descripción:** Un usuario ha acabado la partida. Win indica si ha ganado o perdido.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username_asking`: nombre del usuario que ha acabado la partida.
  - `win`: true si ha ganado, false si ha perdido.
- **Funcionamiento:** El cliente muestra un mensaje indicando si el usuario ha ganado o perdido. 

---

#### close-conection()

- **Descripción:** Se ha cerrado la sesion, al iniciar sesion en otro dispositivo.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:** No recibe datos.
- **Funcionamiento:** El cliente muestra un mensaje indicando que un usuario ha cerrado la conexion.

---

#### cards([cards])

- **Descripción:** Un usuario recibe que cartas tendrá en la partida.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `cards`: lista de cartas que tendrá el usuario.
- **Funcionamiento:** El cliente crea el modal que muestra las cartas que tendrá el usuario en la partida.

---

#### game-info(names, available, guns, rooms, cards, sospechas, posiciones, turnoOwner)

- **Descripción:** Un usuario recibe la informacion de la partida.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `names`: lista de nombres de personajes.
  - `available`: para cada personaje dice que username lo ha seleccionado ya, cadena vacia si no esta seleccionado aun.
  - `guns`: lista de nombres de armas.
  - `rooms`: lista de nombres de habitaciones.
  - `cards`: lista de cartas que tendrá el usuario.
  - `sospechas`: lista de sospechas realizadas.
  - `posiciones`: lista de posiciones de los usuarios en el tablero.
  - `turnoOwner`: nombre del usuario al que le toca el turno.


