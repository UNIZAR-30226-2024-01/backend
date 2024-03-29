const constants = require('./constants');
const { botRun } = require('../bot/bot');



// Create new game session
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

    botRun(objeto)

}

module.exports = {
    runGame
};