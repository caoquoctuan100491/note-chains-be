const express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../configuarations/config');

const dbMoralis = require('../Entities/dbMoralis');
const moralis = new dbMoralis;

router.post('/shop1', async function (req, res) {
    let signature = req.body.signature;
    let wallet = req.headers['w_access_token'];
    // console.log(wallet);
    let data = await moralis.buyNFTByShop(signature, wallet);
    // console.log(data);
    return res.status(200).json(data);
});
router.post('/healall', async function (req, res) {
    
});
module.exports = router;