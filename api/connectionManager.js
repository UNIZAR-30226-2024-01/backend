const Pool = require('pg').Pool;
require('dotenv').config();


const pool = new Pool({
    host:  process.env.DB_HOST,
    user:  process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
})

// Manejo de la señal SIGINT para cerrar correctamente la conexión a la base de datos
process.on('SIGINT', () => {
    pool.end(() => {
      console.log('Desconectado del servidor PostgreSQL');
      process.exit(0);
    });
  });

module.exports = pool;