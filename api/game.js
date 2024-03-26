const constants = require('./constants');

// Create new game session
async function runGame(io,group) {
    
    let username
    let num = 0
    const interval = setInterval(() => {
        username = `user${num+1}`
        console.log(`turno de ${username}`)
        io.to(""+group).emit(constants.CHAT_TURN, username);
        // io.emit(constants.CHAT_TURN, username);
        num++
        num %= 6;

    }, 1000);

    // interval();
}

module.exports = {
    runGame
};