const express = require("express");
const constants = require("./constants.js");
const controller = require("./controller.js");

const router = express.Router();
router.use(express.json());

// Testing

router.get("/test", async (res) => {
  res.json({ success: true, message: constants.TEST });
});

/*

██╗░░░██╗░██████╗███████╗██████╗░░██████╗
██║░░░██║██╔════╝██╔════╝██╔══██╗██╔════╝
██║░░░██║╚█████╗░█████╗░░██████╔╝╚█████╗░
██║░░░██║░╚═══██╗██╔══╝░░██╔══██╗░╚═══██╗
╚██████╔╝██████╔╝███████╗██║░░██║██████╔╝
░╚═════╝░╚═════╝░╚══════╝╚═╝░░╚═╝╚═════╝░
*/
router.post("/createAccount", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const createSuccessfully = await controller.createAccount(
      username,
      password
    );
    res.json({
      success: createSuccessfully.exito,
      message: createSuccessfully.msg,
    });
    console.log(`${createSuccessfully.msg}  : ${createSuccessfully.username}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const resultadoLogin = await controller.login(username, password);
    res.json({ success: resultadoLogin.exito, message: resultadoLogin.msg });
    console.log(resultadoLogin.msg);
  } catch (error) {
    console.error(constants.ERROR_LOGIN, error);
    res.status(500).json({ success: false, message: constants.ERROR_LOGIN });
  }
});

router.get("/obtainXP", async (req, res) => {
  const username = req.query.username;

  try {
    const resultadoXp = await controller.getPlayerXP(username);

    if (resultadoXp.exito) {
      res.status(200).json({ success: true, XP: resultadoXp.XP });
    } else {
      res.status(404).json({ success: false, message: resultadoXp.msg });
    }
  } catch (error) {
    console.error(constants.ERROR_XP, error);
    res.status(500).json({ success: false, message: constants.ERROR_XP });
  }
});

// Game creation
// username = nombre del jugador
// type = l->local, o->online
router.post("/createGame", async (req, res) => {
  const username = req.body.username;
  const type = req.body.type;

  try {
    const createSuccessfully = await controller.createGame(username, type);

    res.json({
      success: createSuccessfully.exito,
      message: createSuccessfully.msg,
      idGame: createSuccessfully.idGame,
    });
    console.log(`${createSuccessfully.msg}  : ${createSuccessfully.username}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/changePassword", async (req, res) => {
  const username = req.body.username;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  try {
    const createSuccessfully = await controller.changePassword(
      username,
      oldPassword,
      newPassword
    );

    res.json({
      success: createSuccessfully.exito,
      message: createSuccessfully.msg,
    });
    console.log(`${createSuccessfully.msg}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/availableCharacters", async (req, res) => {
  // const idGame = req.body.idGame;
  const idGame = 1;
  try {
    const createSuccessfully = await controller.availabilityCharacters(idGame);

    res.json({
      success: createSuccessfully.exito,
      message: createSuccessfully.msg,
      characters: createSuccessfully.characters,
    });
    //true are available characters
    console.log(`${createSuccessfully.msg}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/characterSelected", async (req, res) => {
  const username = req.body.username;
  const character = req.body.character;

  try {
    const createSuccessfully = await controller.selectCharacter(
      username,
      character
    );

    res.json({
      success: createSuccessfully.exito,
      message: createSuccessfully.msg,
    });
    console.log(`${createSuccessfully.msg}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/*
  Example of how to use the function getPlayersCharacter: 
  array.forEach((players) => {
      console.log(`Username: ${players.userName}`);
      console.log(`Character: ${players.character}`);
  });
 */
//post: if the consult was successful, it returns the players and characters of the game 
router.put("/getNameAndCharacter", async (req, res) => {
  const idGame = req.body.id_partida;
  try {
    const createSuccessfully = await controller.getPlayersCharacter(
      idGame
    );
    if (createSuccessfully.exito) {
      res.json({
        success: createSuccessfully.exito,
        players: createSuccessfully.players?createSuccessfully.players:[],
      });
    } else {  
      res.status(404).json({ success: false, message: createSuccessfully.msg });
    }
    console.log(`${createSuccessfully.msg}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
