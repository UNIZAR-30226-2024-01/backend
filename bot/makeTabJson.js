import { infoHabitaciones, infoTablero } from '../../front-end-shared/infoTablero.js';

// Exportar la variable como JSON
import fs from 'fs';
fs.writeFileSync('infoHabitaciones.json', JSON.stringify(infoHabitaciones));
fs.writeFileSync('infoTablero.json', JSON.stringify(infoTablero));
