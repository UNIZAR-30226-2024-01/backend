const constants = require('./constants');
const { botRun } = require('../bot/bot');



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
    
    let username
    let num = 1
    // const interval = setInterval(() => {
    //     username = `user${num+1}`
    //     console.log(`turno de ${username}`)
    //     io.to(""+group).emit(constants.CHAT_TURN, username);
    //     // io.emit(constants.CHAT_TURN, username);
    //     num++
    //     num %= 6;

    // }, 1000);

    objeto = {
        group: group,
        io: io
    }

    // ⬇ queda comentado porque no funciona en produccion 
    // botRun(objeto)
}

module.exports = {
    runGame
};