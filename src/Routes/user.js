const express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../configuarations/config');

const dbMoralis = require('../../Entities/dbMoralis');
const moralis = new dbMoralis;

const QRCode = require('qrcode');
const { authenticator } = require('otplib');

router.post('/register', async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;
    let wallet = req.body.wallet;

    const secretCode = authenticator.generateSecret();

    password = Buffer.from(password, 'base64').toString('binary');
    let account = {
        username: username,
        email: email,
        password: password,
        secretCode: secretCode,
        wallet: wallet,
        network: req.body.network,
        createdAt: new Date(),
    };
    let data = await moralis.Register(account);
    return res.status(200).json(data);
});

router.post('/login', async function (req, res) {
    let password = "oriDungeon" + req.body.wallet;
    password = Buffer.from(req.body.wallet, 'base64').toString('binary');
    let log = {
        username: req.body.wallet,
        password: password,
        wallet: req.body.wallet
    };
    let data = await moralis.Login(log);
    // console.log(data);
    if(data.data.solAddress){
        let token = jwt.sign(data, config.jwtSecret, { expiresIn: 60 * config.tokenExpiresIn });
        // let userDetail = await moralis.getOne_UserDetail(req.body.wallet);
        return res.status(200).json(token);
    }
});

router.post('/set2FA', async function (req, res) {
    const secretCode = "";
    // Prepare the qrcode
    const qrCodeStr = `otpauth://totp/admin@dirox.net?secret=${secretCode}&issuer=Atira`;
    // Generate the QrCode.
    let qrcode = await QRCode.toDataURL(qrCodeStr);
    let data = {};
    data.qrcode = qrcode;
    return res.status(200).json(data);
});

router.post('/changepassword', async function (req, res) {

});

router.post('/lostpassword', async function (req, res) {

});

router.post('/resetpassword', async function (req, res) {

});
module.exports = router;