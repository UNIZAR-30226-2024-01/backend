import { spawn } from 'child_process';
import { infoHabitaciones, infoTablero } from '../front-end-shared/infoTablero.js';

// Exportar la variable como JSON
import fs from 'fs';
fs.writeFileSync('infoHabitaciones.json', JSON.stringify(infoHabitaciones));
fs.writeFileSync('infoTablero.json', JSON.stringify(infoTablero));

// Argumentos para pasar al script de Python
const args = ['parametro1', 'parametro2'];

// Ejecutar el script de Python
const pythonProcess = spawn('python', ['bot.py', ...args]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`Proceso de Python cerrado con código ${code}`);
});
