const { spawn } = require('child_process');

async function botRun(obj) {
    console.log("Bot is running");
    // console.log(obj);
    
    // Argumentos para pasar al script de Python
    const args = ['turn', '31', '3', '2'];
    
    // Ejecutar el script de Python
    const pythonProcess = spawn('python', ['../bot/bot.py', ...args]);
    
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
    botRun
}