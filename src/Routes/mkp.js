const express = require('express');
let router = express.Router();
const dbMoralis = require('../Entities/dbMoralis');
const moralis = new dbMoralis;

router.post('/sellItem', async function (req, res) {
    console.log(req.body);
    let wallet = req.headers['w_access_token'];
    console.log(wallet);
    await moralis.sellItem(wallet, req.body);

});

router.post('/buyItem', async function (req, res) {

});

router.post('/selling', async function (req, res) {

});

router.post('/myStore', async function (req, res) {

});

module.exports = router;