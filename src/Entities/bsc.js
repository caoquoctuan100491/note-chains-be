// function BSCNetwork() { };
// const Constants = require("../Utils/Constants");
// let constNW = Constants.bsc;

// const CMD = require('./cmd');
// const cmd = new CMD();
// const jwt = require('jsonwebtoken');
// const fs = require("fs").promises;
// const Jimp = require("jimp");

// //--Web3 function
// /**bsc mainet -0x38
//  * bsc testnet -0x61
//  * localDev(Ganache, Hardhat) - 0x539
//  */

//  const Web3 = require("web3");
//  const HDWalletProvider  = require('@truffle/hdwallet-provider');
// //  const provider = new HDWalletProvider(constNW.privateKeyAdmin, constNW.providerUrl);
// //  const bscWeb3 = new Web3(provider);
// //  const contractOrimon = new web3.eth.Contract(Constants.abiOrimMon, Constants.addressOriMon);

// BSCNetwork.prototype.checkSignature = async function (signature, typeTransaction, amount, authority, description) {
//     console.log(constNW.privateKeyAdmin);
//     console.log(signature);
    
// }

// BSCNetwork.prototype.createNFTJson = async function (monster, urlImg, arrElement) {

//     let description =
//         "ORIMONSTER created from origami model - " +
//         monster.name +
//         ", design by - " +
//         monster.designer;
//     let json = {
//         name: monster.name,
//         symbol: "Orimon" + monster.tokenId,
//         description: description,
//         seller_fee_basis_points: 0,
//         image: urlImg,
//         external_url: "https://oridungeon.com/",
//         attributes: [
//             {
//                 trait_type: "gHp",
//                 value: monster.gHp
//             },
//             {
//                 trait_type: "gAtk",
//                 value: monster.gAtk
//             },
//             {
//                 trait_type: "gDef",
//                 value: monster.gDef
//             },
//             {
//                 trait_type: "gMat",
//                 value: monster.gMat
//             },
//             {
//                 trait_type: "gMdf",
//                 value: monster.gMdf
//             },
//             {
//                 trait_type: "gAgi",
//                 value: monster.gAgi
//             },
//             {
//                 trait_type: "gifted",
//                 value: monster.gifted
//             },
//             {
//                 trait_type: "hue",
//                 value: monster.hue
//             },
//             {
//                 trait_type: "elements",
//                 value: JSON.stringify(arrElement)
//             },
//         ],
//         collection: {
//             name: "Orimonster",
//             family: "Orimonster"
//         },
//         properties: {
//             files: [{
//                 uri: urlImg,
//                 type: "image/png"
//             }],
//             category: "image",
//             creators: [{
//                 address: keypair.publicKey,
//                 share: 100,
//             }]
//         }
//     };

//     return json;
// }

// BSCNetwork.prototype.generateNFT = async function (urlJson, userWallet) {
   
// }

// module.exports = BSCNetwork;