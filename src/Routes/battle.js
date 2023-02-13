const express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../configuarations/config');

const dbMoralis = require('../Entities/dbMoralis');
const moralis = new dbMoralis;

router.post('/dungeonChallenge', async function (req, res) {
  let wallet = req.headers['w_access_token'];
  console.log(wallet);
  let user = await moralis.getOne_UserDetail(wallet);
  let parties = await moralis.getOrimonsBattle(wallet);
  if (!user.attributes.busy && parties.length > 0) {
    user.set("busy", true);
    const regionId = user.attributes.floor;
    let e = await moralis.getEnemyChallenge(regionId);
    let limitWin = regionId;
    if (regionId > 6) {
      limitWin = 6;
    }
    let limitLose = 0;
    for (let i = 0; i < parties.length; i++) {
      let m = parties[i];
      if (m.curHp > 0) {
        limitLose++;
      }
    }

    await moralis.setupBattle(1, wallet, JSON.stringify(e), limitWin, limitLose, null);

    return res.status(200).json({});
  } else {
    return res.status(200).json({});
  }
});

router.post('/escape', async function (req, res) {
  let wallet = req.headers['w_access_token'];
  await moralis.escapse(wallet);
  return res.status(200).json({});
})

module.exports = router;