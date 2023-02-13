function SolanaNetwork() { };
const fetch = require('node-fetch');

const Constants = require("../Utils/ConstSolana");
let constNW = Constants.testnet;

const CMD = require('./cmd');
const cmd = new CMD();

const { programs, NodeWallet, actions, utils } = require('@metaplex/js');
const { metadata: { Metadata } } = programs;

const { Keypair, clusterApiUrl, Connection, PublicKey } = require("@solana/web3.js");
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
let secretKey = Uint8Array.from(constNW.privateKeyAdmin);
let keypair = Keypair.fromSecretKey(secretKey);
let network = 'testnet';
// const connection = new Connection('testnet');



SolanaNetwork.prototype.checkSignature = async function (signature, typeTransaction, amount, authority, description) {
    const connection = new Connection(clusterApiUrl(network), "confirmed");
    // console.log(connection);
    let trx = null;
    while (trx == null) {
        trx = await connection.getParsedConfirmedTransaction(signature);
    }
    let check = 0;
    // console.log(trx);

    let info = trx.transaction.message.instructions[0].parsed.info;
    let trxType = trx.transaction.message.instructions[0].parsed.type;
    console.log(info);
    let accountKeys = trx.transaction.message.accountKeys;
    for (let i = 0; i < accountKeys.length; i++) {
        let publicKey = accountKeys[i].pubkey.toString();
        if (publicKey == authority) {
            // console.log('authority');
            check++;
        }
        if (publicKey == description) {
            // console.log('description');
            check++;
        }
    }
    if (info.amount) {
        if (parseInt(info.amount) == amount) {
            // console.log('amount 1');
            check++;
        }
    } else {
        if (parseInt(info.lamports) == amount) {
            // console.log('amount 2');
            check++;
        }
    }
    if (trxType == typeTransaction) {
        // console.log('typeTransaction');
        check++;
    }
    if (check == 4) {
        return true;
    }
    return false;
}


SolanaNetwork.prototype.createNFTJson = async function (monster, urlImg, arrElement) {
    let description =
        "ORIMONSTER created from origami model - " +
        monster.name +
        ", design by - " +
        monster.designer;
    let json = {
        name: monster.name,
        symbol: "Orimon" + monster.tokenId,
        description: description,
        seller_fee_basis_points: 0,
        image: urlImg,
        external_url: "https://oridungeon.com/",
        attributes: [
            {
                trait_type: "gHp",
                value: monster.gHp
            },
            {
                trait_type: "gAtk",
                value: monster.gAtk
            },
            {
                trait_type: "gDef",
                value: monster.gDef
            },
            {
                trait_type: "gMat",
                value: monster.gMat
            },
            {
                trait_type: "gMdf",
                value: monster.gMdf
            },
            {
                trait_type: "gAgi",
                value: monster.gAgi
            },
            {
                trait_type: "gifted",
                value: monster.gifted
            },
            {
                trait_type: "hue",
                value: monster.hue
            },
            {
                trait_type: "elements",
                value: JSON.stringify(arrElement)
            },
            {
                trait_type: "found by",
                value: monster.foundBy
            }
        ],
        collection: {
            name: "Orimonster",
            family: "Orimonster"
        },
        properties: {
            files: [{
                uri: urlImg,
                type: "image/png"
            }],
            category: "image",
            creators: []
        }
    };

    return json;
}

SolanaNetwork.prototype.generateNFT = async function (urlJson, userWallet) {
    const connection = new Connection(clusterApiUrl(network), "confirmed");
    // console.log(urlJson);
    let url = "https://gateway.moralisipfs.com/ipfs/" + urlJson;
    // let url = "https://ipfs.io/ipfs/" + urlJson;
    let fromWallet = new NodeWallet(keypair);
    // console.log(keypair);
    // console.log(fromWallet);
    let mintNFTResponse = await actions.mintNFT({
        connection,
        wallet: fromWallet,
        uri: url,
        maxSupply: 1
    });

    let trx = null;
    // console.log(mintNFTResponse);
    if (mintNFTResponse) {
        while (trx == null) {
            trx = await connection.getParsedTransaction(mintNFTResponse.txId);
        }
        if (trx != null) {
            // let responeTransfer = await that.transferToken(mintNFTResponse.mint, fromWallet, userPublicKey);
            await cmd.transfer(mintNFTResponse.mint.toString(), userWallet, 1);
            while (trx == null) {
                trx = await connection.getParsedTransaction(mintNFTResponse.txId);
            }
        }

    }
    return mintNFTResponse.mint.toString();
}

SolanaNetwork.prototype.getNFTs = async function (ownerPublickey) {
    const connection = new Connection(clusterApiUrl(network), "confirmed");
    const nftsmetadata = await Metadata.findDataByOwner(connection, ownerPublickey);
    let arrOrimonster = [];
    // console.log(nftsmetadata);
    if (nftsmetadata.length > 0) {
        for (let i = 0; i < nftsmetadata.length; i++) {
            let MetadataData = nftsmetadata[i];
            let uri = MetadataData.data.uri;
            let settings = { method: "Get" };
            let res = await fetch(uri, settings);
            let metadata = await res.json();
            let trait_type = metadata.attributes[metadata.attributes.length - 1].trait_type;
  
            if (trait_type == 'certification') {
                let certification = metadata.attributes[metadata.attributes.length - 1].value;
                let strTokenId = MetadataData.data.symbol.replace('Orimon', '');
                let stringAttr = metadata.attributes[0].value+metadata.attributes[1].value+metadata.attributes[2].value+metadata.attributes[3].value+metadata.attributes[4].value+metadata.attributes[5].value;
                if (MetadataData.data.symbol.includes('Orimon') && certification.includes('ori') && certification.includes(strTokenId + 'm0nt3r') && certification.includes(stringAttr)) {
                    let orimonster = {
                        tokenId : parseInt(strTokenId),
                        certification: certification,
                    };
                    arrOrimonster.push(orimonster);
                }
            }
        }
    }
    // console.log(arrOrimonster);
    return arrOrimonster;
}

SolanaNetwork.prototype.createAccountTokens = async (wallet, mintAddress) => {
    console.log(mintAddress);
    let mintPublicKey = new PublicKey(mintAddress);
    let fromPublicKey = new PublicKey(wallet);
    const connection = new Connection(clusterApiUrl(network), "confirmed");
    const mint = new Token(connection, mintPublicKey, TOKEN_PROGRAM_ID, fromPublicKey);
    // console.log(mint);
    // const tokenAccount = await getOrCreateAssociatedTokenAccount(
    //     connection,
    //     payer,
    //     mint,
    //     payer.publicKey
    // )
    let fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
        fromPublicKey,
    );

    // console.log(fromTokenAccount);

    // console.log(tokenAccount.address.toBase58());
}


module.exports = SolanaNetwork;