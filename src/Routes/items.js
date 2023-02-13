const express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../configuarations/config');

const dbMoralis = require('../Entities/dbMoralis');
const moralis = new dbMoralis;

router.post('/usingItem', async function (req, res) {

});

module.exports = router;