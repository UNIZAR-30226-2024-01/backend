const { spawn } = require('child_process');

async function moveBot() {
  console.log('Bot is running');
  // console.log(obj);

  const args2 = [[40, 199, 230, 103, 559, 430], 5, 7, "tarjeta"];
    
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
