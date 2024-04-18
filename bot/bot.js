const { spawn } = require('child_process');

async function moveBot(obj) {
  console.log('Bot is running');
  // console.log(obj);
    
  // Argumentos para pasar al script de Python
  // turn o susp, celda id, dados, nivel
  const args = ['turn', '451', '2', '2'];

  // Petición a la base de datos
  // Definir la URL de la API

  const args2 = ['susp', 1, 3, 3, 5, 'MR.SOPER', 'CAFETERIA', 'ROUTER', true, tarjeta, 'MR.SOPER'];
    
  // Ejecutar el script de Python
  const pythonProcess = spawn('python', ['../bot/moveBot.py', ...args2]);
    
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
  moveBot,
  updateCard
};
