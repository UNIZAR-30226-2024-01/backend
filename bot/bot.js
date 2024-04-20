const { spawn } = require('child_process');
const constants = require('../api/constants.js');
const N_PLAYERS = 6;

function createBot(me, cards) {
  console.log('Creating bot...');

  // Scar el índice de car1, card2 y card3
  for (let i = 0; i < cards.length; i++) {
    if (constants.ROOMS_NAMES.indexOf(cards[i]) === -1) {
      if (constants.CHARACTERS_NAMES.indexOf(cards[i]) === -1) {
        cards[i] = constants.GUNS_NAMES.indexOf(cards[i]) + constants.ROOMS_NAMES.length + constants.CHARACTERS_NAMES.length;
      } else {
        cards[i] = constants.CHARACTERS_NAMES.indexOf(cards[i]) + constants.ROOMS_NAMES.length;
      }
    } else {
      cards[i] = constants.ROOMS_NAMES.indexOf(cards[i]);
    }
    console.log('Card: ' + cards[i]);
  }
  // Crear un string de (N_PLACES+N_ROOMS+N_THINGS)*N_PLAYERS
  const tarjeta = [];
  for (let i = 0; i < constants.CHARACTERS_NAMES.length + constants.GUNS_NAMES.length + constants.ROOMS_NAMES.length; i++) {
    for (let j = 0; j < N_PLAYERS; j++) {
      if (i === cards[0] || i === cards[1] || i === cards[2]) {
        if(j === me) {
          tarjeta.push(100);
        } else {
          tarjeta.push(0);
        }
      } else {
        if (j === me) {
          tarjeta.push(0);
        } else {
          tarjeta.push(50);
        }
      }
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

  const args_lvl1 = [3, 1, 3, 1, 'biblioteca', 'miss REDES', 'troyano', 0, tarjeta];
  const args_lvl1_sordo = [3, 1, 2, 1, 'biblioteca', 'miss REDES', 'troyano', 0, tarjeta];
  const args_lvl2 = [3, 2, 2, 1, 'recepcion', 'mr SOPER', 'cd', 2, tarjeta];
  const args_lvl3 = [3, 3, 2, 1, 'recepcion', 'mr SOPER', 'cd', 2, tarjeta];

  const pythonProcess = spawn('python3', ['../bot/updateCard.py', ...args_lvl3]);

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
