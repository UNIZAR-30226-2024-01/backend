const express = require('express');
const constants = require('./constants.js');
const src = require('./src.js');


const router = express.Router();
router.use(express.json());


router.get(constants.TEST, async (res) => {
  res.json({ success: true, message: constants.TEST});
});

router.post(constants.CREATE_ACCOUNT, async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  try {
    const createSuccessfully = await src.createAccount(username,password);
    res.json({ success: createSuccessfully.exito, message: createSuccessfully.msg});
    console.log(`${createSuccessfully.msg}  : ${createSuccessfully.username}`);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post(constants.LOGIN, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const resultadoLogin = await src.login(username,password);
    res.json({ success: resultadoLogin.exito, message: resultadoLogin.msg });
    console.log(resultadoLogin.msg);

  } catch (error) {
    console.error(constants.ERROR_LOGIN, error);
    res.status(500).json({ success: false, message: constants.ERROR_LOGIN });
  }
});


router.post(constants.XP, async (req, res) => {
  const username = req.body.username;
  try {
    const resultadoXp = await src.getPlayerXP(username);

    if (resultadoXp.exito) {
      res.status(200).json({ success: true, XP: resultadoXp.XP });
    } else {
      res.status(404).json({ success: false, message: resultadoXp.msg});
    }
  } catch (error) {
    console.error( constants.ERROR_XP , error);
    res.status(500).json({ success: false, message: constants.ERROR_XP });

  }
});

router.post(constants.CREATE_GAME, async (req, res) => {

  const username = req.body.username;
  const type = req.body.type;

  try {
    const createSuccessfully = await src.createGame(username,type);
    res.json({ success: createSuccessfully.exito, message: createSuccessfully.msg});
    console.log(`${createSuccessfully.msg}  : ${createSuccessfully.username}`);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;