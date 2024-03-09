const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const { createServer } = require('http');
require('dotenv').config();
const { logger }  = require ('morgan');
const morgan = require('morgan');
const src = require('./src.js');


const app = express()
const port = 3000
const server = createServer(app)
const io = new Server(server,{
  cors: {
    origin: "https://localhost:3000"
  }
});

const pool = new Pool({
  host:  process.env.DB_HOST,
  user:  process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

// Servir archivos estáticos desde la carpeta 'build' (o la carpeta que contiene tu aplicación React compilada)
app.use(express.static("../../front-end-web/front-end-react/dist"));
app.use(bodyParser.json())
app.use(morgan('dev'))

/*// Handle joining a room
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });*/
const addSocketToGroup = (socket) => {
  const username = socket.handshake.auth.username
  const group = socket.handshake.auth.group
  socket.join(group)
  console.log(`a user ${username} has connected to ${group} `)
}

io.on('connection', (socket) => {
  console.log('a user has connected')
  
  addSocketToGroup(socket)

  socket.on('disconnect', () => {
    console.log('a user has disconnected')
  })
  
  socket.on('chat message', (msg) => {
    //io.emit('chat response', socket.handshake.auth.username, msg)

    io.to(socket.handshake.auth.group).emit('chat response', socket.handshake.auth.username, msg);

    console.log(`Msg: ${msg}`)
  })

})

// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
  done();

});
// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle SIGINT signal to close the database connection properly
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Disconnected from PostgreSQL server');
    process.exit(0);
  });
});


app.post('/createAccount', async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;
 
  try {
    const createSuccessfully = await src.createAccount(username,password);

    if (createSuccessfully) {
      res.json({ success: true, message: 'Usuario creado correctamente' });
      console.log(`Usuario creado correctamente:  ${createSuccessfully}`);
    } else {
      res.json({ success: false, message: 'Usuario no creado' });
      console.log(`Usuario no creado correctamente`);
    }
} catch (error) {
    if (error.code == '23505') {
      res.status(23505).json({ success: false, message: error.message });
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });

}
});


app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
 // console.log('dentro de login');

 
  try {
    const resultadoLogin = await src.login(username,password);

    if (resultadoLogin.exito) {
      res.json({ success: true, message: 'Se ha iniciado sesión correctamente' });
      console.log('Se ha iniciado sesión correctamente');
    } else { //mirar fallos
      res.json({ success: false, message: 'No se ha iniciado sesión' });
      console.log('No se ha iniciado sesión');
    }

  } catch (error) {
    console.error('Error al realizar el inicio de sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al realizar el inicio de sesión' });
  }
});