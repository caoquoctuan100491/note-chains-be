const express = require('express');
let router = express.Router();
const fs = require("fs");

const dbMoralis = require('../Entities/dbMoralis');
const moralis = new dbMoralis;

router.post('/updateCharacter', async function (req, res) {
    let update = {
        wallet: req.headers['w_access_token'],
        char: req.body._Name,
        charIndex: parseInt(req.body._Index)
    };
    
    await moralis.update_UserDetail(update);
    return res.status(203).json({});
});

router.post('/tlp', async function (req, res) {
    var wallet = req.headers['w_access_token'];
    var toFloor = parseInt(req.body.index) + 1;
    let user = await moralis.getOne_UserDetail(wallet);
    let parties = await moralis.getOrimons(wallet);
    if (parties.party1.length > 0) {
        if (toFloor <= user.attributes.floor) {
            user.set("map", toFloor);
            user.set("curMap", "F" + toFloor);
            let now = new Date().getTime();
            let arEvent = await moralis.getEventMap(toFloor, user.attributes.floor);
            let mapTime = user.attributes.mapTime;
            if (arEvent.length > 0 && ((now - mapTime) / 60000 > 60)) {
                user.set("mapTime", new Date().getTime());
                user.set("curEv", arEvent);
            }
            user.save(null, { useMasterKey: true });
            return res.status(200).json(user.attributes);
        }
    }
    return res.status(203).json({});

});

router.post('/loadmoreMonsterBag', async function (req, res) {

});

router.post('/generateNFT', async function (req, res) {
    let response = await moralis.generateNFT(parseInt(req.body.tokenId), req.headers['w_access_token'], req.body.signature);
    return res.status(200).json(response);
});

router.post('/swtichParty', async function (req, res) {
    await moralis.swtichParty(JSON.parse(req.body.party1), JSON.parse(req.body.party2), req.headers['w_access_token']);
    return res.status(200).json({});
});
module.exports = router;