const { spawn } = require('child_process');
const constants = require('../api/constants.js');
const N_PLAYERS = 6;

async function createBot() {
  console.log('Creating bot...');

  // Crear un string de (N_PLACES+N_ROOMS+N_THINGS)*N_PLAYERS
  const tarjeta = [];
  for (let i = 0; i < constants.CHARACTERS_NAMES.length + constants.GUNS_NAMES.length + constants.ROOMS_NAMES.length; i++) {
    for (let j = 0; j < N_PLAYERS; j++) {
      tarjeta.push(50);
    }
  }

  const strTarjeta = tarjeta.join(',');
  return strTarjeta;
}

async function moveBot(tarjeta) {
  console.log('Bot is running');
  // console.log(obj);

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

async function updateCard(){
  console.log('Updating card');

  const args = ['updateCard'];
  const pythonProcess = spawn('python', ['../bot/updateCard.py', ...args]);
}

module.exports = {
  createBot,
  moveBot,
  updateCard
};
