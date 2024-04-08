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
