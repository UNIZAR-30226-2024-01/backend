const constants = require('./constants');

//orden de turnos: mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA
//posicion inicial asociada al personaje

//RECONSIDERAR SI RENTA DEJAR ELEGIR JUGADOR
//yo creo que no costaría demasiado y lo pusimos inicialmente en los requisitos del sistema

async function joinGame(username,idGame){

    //update jugador 
    await joinGame(username,idGame);

    //asignar personaje
    await assignCharacter(username);



    //asignar posicion asociada a personaje

}

// function that change the turn of the player
async function runGame(io,group) {
    
    

    // interval();
}

module.exports = {
    runGame
};