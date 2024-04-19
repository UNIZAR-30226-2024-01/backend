const { spawn } = require('child_process');
const constants = require('../api/constants.js');
const N_PLAYERS = 6;

function createBot() {
  console.log('Creating bot...');

  // Crear un string de (N_PLACES+N_ROOMS+N_THINGS)*N_PLAYERS
  const tarjeta = [];
  for (let i = 0; i < constants.CHARACTERS_NAMES.length + constants.GUNS_NAMES.length + constants.ROOMS_NAMES.length; i++) {
    for (let j = 0; j < N_PLAYERS; j++) {
      // Numero aleatorio entre 0 y 100
      const random = Math.floor(Math.random() * 101);
      tarjeta.push(random);
    }
  }

  const strTarjeta = tarjeta.join(',');
  return strTarjeta;
}

async function moveBot(tarjeta) {
  console.log('Bot is running...');
  console.log('Parameters: <List of players\' positions>, <my index>, <my dice>, <my card>');

  const args2 = [[40, 370, 394, 372, 396, 371], 5, 7, tarjeta];
    
  // Ejecutar el script de Python
  const pythonProcess = spawn('python3', ['../bot/moveBot.py', ...args2]);
    
  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
    
  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
    
  pythonProcess.on('close', (code) => {
    console.log(`Proceso de Python cerrado con código ${code}`);
  });
}

async function updateCard(tarjeta){
  console.log('Updating card...');
  console.log('Parameters: <me> <lvl> <asker> <holder> <where> <who> <what> <hasSmg> <card>');

  const args = [3, 1, 3, 1, 'biblioteca', 'miss REDES', 'troyano', 0, tarjeta];

  const pythonProcess = spawn('python3', ['../bot/updateCard.py', ...args]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Proceso de Python cerrado con código ${code}`);
  });
}

module.exports = {
  createBot,
  moveBot,
  updateCard
};
