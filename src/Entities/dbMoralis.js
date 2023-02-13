/**Moralis */
// In a node environment
function dbMoralis() { };

const Constants = require("../Utils/Constants");
const CMD = require('./cmd');
const cmd = new CMD();
const jwt = require('jsonwebtoken');
const config = require('../configuarations/config');
const fs = require("fs");
const Jimp = require("jimp");

const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(Constants.pinataKey, Constants.pinataSecret);
//Moralis

//-- init
const Solana = require('./solana');
const ConstSolana = require('../Utils/ConstSolana');
const solana = new Solana();

const Moralis = require("moralis/node");
const { constants } = require("buffer");
const serverUrl = ConstSolana.testnet.MORALIS_SERVER;
const appId = ConstSolana.testnet.MORALIS_APPID;
const masterKey = ConstSolana.testnet.MORALIS_MASTER_KEY;
Moralis.start({ serverUrl, appId, masterKey });

// const BSC = require('./bsc');

// const bsc = new BSC();

let network = solana;
let constNW = ConstSolana.testnet;


/**
 * Blockchain
 * */

dbMoralis.prototype.checkNetwork = async function (wallet) {
    const obj = await this.getOne_UserDetail(wallet);
    if (obj) {
        let nw = obj.attributes.network;
        if (nw == "true") {
            network = solana;
            constNW = ConstSolana.testnet;

        } else {
            network = bsc;
            constNW = Constants.bsc;

        }
    }
}

/** NFT
 * 
 * 
 * 
*/

dbMoralis.prototype.addOriMonster = async function (wallet, indexActor) {
    let tokenId = await this.getTokenId();
    await this.AddUpdate_System({ totalToken: tokenId + 1 });
    let monsterNoSkill = await this.createMonster(indexActor);

    let NFT = await this.createNFT(tokenId, monsterNoSkill, wallet);
    await this.addMonsterToParties(wallet, tokenId);
    return NFT;
}

dbMoralis.prototype.generateNFT = async function (tokenId, authority, signature) {
    // await this.checkNetwork(authority);
    let res = {};
    let verify = false;
    if (signature) {
        console.log(signature);
        verify = await network.checkSignature(signature, 'transfer', constNW.feeGenerateNFT * 10 ** 9, authority, constNW.addressSystem);
        console.log(verify);
        if (verify) {
            let objParties = await this.getOne_Parties(authority);
            let party1 = objParties.attributes.party1;
            let party2 = objParties.attributes.party2;
            if (party1.includes(tokenId) || party2.includes(tokenId)) {
                let Orimonster = await this.getMonsterByTokenId(tokenId);
                if (!Orimonster.isNFT) {
                    let resGenerate = await network.generateNFT(Orimonster.urlNFT, authority);
                    // Orimonster.isNFT = true;
                    let update_Monster = {
                        tokenId: Orimonster.tokenId,
                        isNFT: true,
                    }
                    await this.update_Monster(update_Monster);
                    await this.add_BlockChainLogs('transfer', authority, signature, constNW.addressSystem, resGenerate, tokenId);
                    res.code = 200;
                } else {
                    res.code = 300;
                }

            }
        }
    }
    return res;
}

dbMoralis.prototype.buyNFTByShop = async function (signature, wallet) {
    // await this.checkNetwork(wallet);
    let res = {};
    try {
        console.log(signature);
        let verify = await network.checkSignature(signature, 'transfer', 3 * 10 ** 9, wallet, constNW.accountORIT);
        console.log(verify);
        if (verify) {
            const query = new Moralis.Query(BlockChainLogs);
            query.equalTo("signature", signature);
            const obj = await query.first({ useMasterKey: true });
            if (!obj) {
                let indexActor = randomMinMax(0, Constants.MAX_ACTOR);
                res.monster = await this.addOriMonster(wallet, indexActor);
                await this.update_Monster({ tokenId: res.monster.tokenId, isNFT: res.monster.isNFT });
                res.code = 200;
                //save logs
                await this.add_BlockChainLogs('transfer', wallet, signature, constNW.addressORIT, '', res.monster.tokenId);
                //update system
                return res;
            }
        }
    }
    catch (error) {
        console.log("Error: " + error.code + " " + error.message);
    }
}

dbMoralis.prototype.createNFT = async function (tokenId, monsterNoSkill, wallet) {
    try {
        let monster = await this.setSkillMonster(monsterNoSkill, 0);
        let arrElement = [];
        for (let i = 0; i < monster.elements.length; i++) {
            let element = await convertElementtoString(monster.elements[i]);
            arrElement.push(element);
        }
        const path = Constants.PATH_ORIMONSTER + tokenId + ".png";
        await drawImage(monster, path);
        let response = await this.sendIMGByPinata(tokenId);
        let urlImg = 'https://gateway.moralisipfs.com/ipfs/' + response;
        // let urlImg = 'https://gateway.pinata.cloud/ipfs/' + response;
        // let urlImg = 'https://ipfs.io/ipfs/' + response;
        //Save monster to database
        monster.urlImg = urlImg;
        monster.isNFT = false;
        monster.foundBy = wallet;

        const mMonster = new Monster();
        monster.tokenId = tokenId;
        let json = await network.createNFTJson(monster, urlImg, arrElement);
        monster.metadata = JSON.stringify(json);

        await mMonster.save(monster, { useMasterKey: true });
        await fs.writeFileSync("./orimonster/" + monster.tokenId + '.json', JSON.stringify(monster));
        await fs.unlink(path, (err => {
            if (err) console.log("unlink " + err);
        }));
        return monster;
    } catch (error) {
        console.error("Err:" + error);
    }

}

dbMoralis.prototype.getUrlNFT = async function (data) {
    let monster = await this.getMonsterByTokenId(data.tokenId);
    if (!monster.certification) {
        let stringMetadata = monster.metadata;
        let json = JSON.parse(stringMetadata);

        let user = {
            address: data.address,
            share: 100
        }
        if (json) {
            json.properties.creators.push(user);
            let verify = jwt.sign(json, config.jwtSecret, { expiresIn: 60 * config.tokenExpiresIn });
            let stringAttr = json.attributes[0].value + json.attributes[1].value + json.attributes[2].value + json.attributes[3].value + json.attributes[4].value + json.attributes[5].value;
            // console.log(stringAttr);
            verify = verify.substring(verify.length - 10) + stringAttr + verify.substring(0, 9) + 'ori' + verify + monster.tokenId + 'm0nt3r' + verify.substring(0, 20);
            // console.log(verify);
            json.attributes.push({ trait_type: 'certification', value: verify });
            // json.certification = verify;
            let urlNFT = await this.sendJsonMoralis(json);

            let monsterUpdate = { tokenId: monster.tokenId, certification: verify, urlNFT: urlNFT };
            await this.update_Monster(monsterUpdate);

            let jsonMonster = await this.getMonsterByTokenId(data.tokenId);

            await fs.writeFileSync("./orimonster/" + monster.tokenId + '.json', JSON.stringify(jsonMonster));

            return urlNFT;
        }
    } else {
        return monster.urlNFT;
    }
}

dbMoralis.prototype.sendIMGByPinata = async function (tokenId) {
    const path = Constants.PATH_ORIMONSTER + tokenId + ".png";
    // const data = fs.createReadStream(path);
    const options = {
        pinataMetadata: {
            name: tokenId + ".png",
            keyvalues: {}
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    let res = await pinata.pinFromFS(path, options);
    return res.IpfsHash;
}

dbMoralis.prototype.sendJsonByPinata = async function (json) {
    const options = {
        pinataMetadata: {
            name: tokenId + ".json",
            keyvalues: {}
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    let res = await pinata.pinJSONToIPFS(json, options);
    return res.IpfsHash;
}

dbMoralis.prototype.sendImageMoralis = async function (tokenId) {
    const path = Constants.PATH_ORIMONSTER + tokenId + ".png";
    const data = fs.readFileSync(path);
    // console.log(Array.from(Buffer.from(data, 'binary')));
    const file = new Moralis.File(tokenId + ".png", data, { 'Content-Type': 'image/png' });
    await file.saveIPFS({ useMasterKey: true });
    // console.log(file.ipfs());
    // console.log(file.hash());
    return file.hash();
}

dbMoralis.prototype.sendJsonMoralis = async function (json) {
    const btoa = function (str) { return Buffer.from(str).toString('base64'); }
    const file = new Moralis.File("file.json", { base64: btoa(JSON.stringify(json)) });
    await file.saveIPFS({ useMasterKey: true });
    // console.log(file.ipfs());
    // console.log(file.hash());
    return 'https://gateway.moralisipfs.com/ipfs/' + file.hash();
}

/**User
 * 
 * 
 * 
 */

dbMoralis.prototype.Login = async function (data) {
    let res = {};
    try {
        let obj = await this.getUser(data.wallet);
        if (obj) {
            let userDetail = await this.getOne_UserDetail(data.wallet);
            if (!userDetail) {
                // solana.createAccountTokens(data.wallet, ConstSolana.testnet.addressORIT);
                // solana.createAccountTokens(data.wallet, ConstSolana.testnet.addressSoulStone);
                // solana.createAccountTokens(data.wallet, ConstSolana.testnet.addressItem_Mirror);
                // solana.createAccountTokens(data.wallet, ConstSolana.testnet.addressItem_SAD);
                // solana.createAccountTokens(data.wallet, ConstSolana.testnet.addressGuildToken);
                await this.initUserDetail(data.wallet);
                await this.addOriMonster(data.wallet, 0);
            }
            let Arena = await this.getOne_ARENA(data.wallet);
            if (!Arena) {
                let dataArena = {
                    points: 1000,
                    win: 0,
                    lose: 0,
                    wallet: data.wallet,
                    rewards: [],
                };
                await this.add_ARENA(dataArena);
            }
            this.syncNFTParties(data.wallet);
            res.code = 200;
            res.data = obj.attributes;
        }
    } catch (error) {
        // Show the error message somewhere and let the user try again.
        console.log("Login: " + error.message);
        res.code = error.code;
    }
    return res;
}

/**UserDetail  
 * 
 * 
 * 
*/
dbMoralis.prototype.initUserDetail = async function (wallet) {
    let username = wallet.substring(0, 5) + "..." + wallet.substring(wallet.length - 5);
    let detail = {
        username: username,
        wallet: wallet,
        wonFloor: 0,
        floor: 1,
        char: 'a0',
        charIndex: 0,
        socketId: "",
        busy: false,
        curMap: "",
        curMapId: 0,
        mapTime: 0,
        items: "",
        isLoged: false,
        curEv: [],
        badge: [],
        achievement: [],
        network: 'Sol'
    }
    await this.add_UserDetail(detail);
}

dbMoralis.prototype.resetLogin = async function () {
    let listUser = await this.getAll_UserDetail();
    if (listUser) {
        listUser.forEach(userD => {
            userD.set("isLoged", false);
            userD.save(null, { useMasterKey: true });
        });
    }
}

dbMoralis.prototype.addFriends = async function (username, friend) {
    let userDetail = await this.getOne_UserDetailByName(username);
    let friends = userDetail.get('friends');
    if (!friends) {
        friends = [friend];
    } else {
        friends.push(friend);
    }
    let update = {
        wallet: userDetail.get('wallet'),
        friends: friends
    };
    await this.update_UserDetail(update);
}

/**Monster
 * 
 * 
 * 
*/

dbMoralis.prototype.createMonster = async function (index) {
    let baseActor = await this.get_Actor(index);
    let newMonster = await this.getVariableMonster(baseActor, 0, 50);
    return await this.initMonster(newMonster, baseActor, 1);
}

dbMoralis.prototype.getVariableMonster = async function (actor, min, max) {
    let viHp = randomMinMax(min, max);
    let viAtk = randomMinMax(min, max);
    let viDef = randomMinMax(min, max);
    let viMat = randomMinMax(min, max);
    let viMdf = randomMinMax(min, max);
    let viAgi = randomMinMax(min, max);
    let hue = randomMinMax(0, 360);

    let newActor = {};
    newActor.designer = actor.designer;
    newActor.name = actor.name;
    newActor.class = actor.class;
    newActor.gHp = viHp;
    newActor.gAtk = viAtk;
    newActor.gDef = viDef;
    newActor.gMat = viMat;
    newActor.gMdf = viMdf;
    newActor.gAgi = viAgi;
    newActor.gifted = viHp + viAtk + viDef + viMat + viMdf + viAgi;
    newActor.hue = hue;

    newActor.elements = [];

    for (let n = 0; n < 11; n++) {
        if (n == 0) {
            var elementid = convertElementToInt(actor.element);
            newActor.elements.push(elementid.toString());
        } else {
            let canAddE = randomMinMax(0, 100);
            if (canAddE < 10) {
                let E = randomMinMax(1, 11);
                if (!newActor.elements.includes(E.toString())) {
                    newActor.elements.push(E.toString());
                }
            } else {
                break;
            }
        }
    }

    return newActor;
}

dbMoralis.prototype.initMonster = async function (newActor, baseActor, level) {
    newActor.trHp = 0;
    newActor.trAtk = 0;
    newActor.trDef = 0;
    newActor.trMat = 0;
    newActor.trMdf = 0;
    newActor.trAgi = 0;
    newActor.training = 0;

    newActor.mhp = baseActor.hp[1] + (level - 1) * (parseInt(baseActor.hp[1] / 5));
    newActor.atk = baseActor.atk[1] + (level - 1) * (parseInt(baseActor.atk[1] / 5));
    newActor.def = baseActor.def[1] + (level - 1) * (parseInt(baseActor.atk[1] / 5));
    newActor.mat = baseActor.mat[1] + (level - 1) * (parseInt(baseActor.atk[1] / 5));
    newActor.mdf = baseActor.mdf[1] + (level - 1) * (parseInt(baseActor.atk[1] / 5));
    newActor.agi = baseActor.agi[1] + (level - 1) * (parseInt(baseActor.atk[1] / 5));

    newActor.curExp = 0;
    newActor.color = 0;

    newActor.curHp = getRealHP(newActor.mhp, newActor.gHp, newActor.trHp, level, newActor.color);
    newActor.level = level;
    newActor.evo = 0;
    return newActor;
}

dbMoralis.prototype.findMonsterByArray = async function (array) {
    const query = new Moralis.Query(Monster);
    query.containedIn("tokenId", array);
    return await query.find({ useMasterKey: true });
}

dbMoralis.prototype.getMonsterByTokenId = async function (tokenId) {
    const query = new Moralis.Query(Monster);
    query.equalTo("tokenId", tokenId);
    let obj = await query.first({ useMasterKey: true });
    if (obj) {
        return obj.attributes;
    } else {
        return false;
    }
}


/**Skill 
 * 
 * 
 * 
*/

/**
 * 
 * @param {*} monster 
 * @param {*0 is monster, 1 is enemy} typeMonster 
 * @returns 
 */
dbMoralis.prototype.setSkillMonster = async function (monster, typeMonster) {
    const query = new Moralis.Query(Skill);
    let elementId = parseInt(monster.elements[0]);
    query.equalTo("elementId", elementId);
    const arr = await query.find({ useMasterKey: true });
    monster.skills = {};
    monster.skills["222"] = 10;
    if (typeMonster == 0) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].attributes.pw == 40) {
                monster.skills[arr[i].attributes.skillId] = 10;
                break;
            }
        }
    } else {
        monster.elementSkill = arr;
    }
    return monster;
}

dbMoralis.prototype.getSkillById = async function (skillId) {
    const query = new Moralis.Query(Skill);
    query.equalTo("skillId", skillId);
    const obj = await query.first({ useMasterKey: true });

    return obj.attributes;
}

/**Items 
 * 
 * 
 * 
*/

/**Map
 * 
 * 
 * 
*/
dbMoralis.prototype.hunterMonster = async function (wallet) {
    let rd = randomMinMax(0, 100);
    // console.log(rd);
    let user = await this.getOne_UserDetail(wallet);
    if (!user.attributes.busy && user.attributes.stepCounter >= 10 && rd < 10) {
        let parties = await this.getOrimons(wallet);

        let orimonster = parties.party1[0];

        if (orimonster.curHp > 0) {
            user.set("stepCounter", 0);
            user.set("busy", true);
            user.save(null, { useMasterKey: true });
            let e = await this.getEnemyNatural(user.attributes.floor);
            let limitLose = getLimitLose(parties.party1);
            await this.setupBattle(0, wallet, JSON.stringify(e), 1, limitLose, null);

            return true;
        }
    } else {
        user.set("step", user.attributes.step + 1);
        user.set("stepCounter", user.attributes.stepCounter + 1);
        user.save(null, { useMasterKey: true });
        return false;
    }
}

dbMoralis.prototype.findEnemyByRegion = async function (regionId) {
    const query = new Moralis.Query(Actor);
    query.lessThan("regionId", (regionId + 1));
    const arr = await query.find({ useMasterKey: true });
    let rd = randomMinMax(0, arr.length - 1);
    let baseMonster = arr[rd].attributes;
    return baseMonster;
}

dbMoralis.prototype.getEventMap = async function (mapId, floor) {
    let arrEvent = [];
    let min = 2;
    let max = Constants.MAX_EVENT;
    let rateAdd = 5; // rate to get add an event

    if (mapId == floor) {
        arrEvent.push(1);
    }
    for (let i = 0; i < Constants.MAX_EVENT; i++) {
        let rdAdd = randomMinMax(0, 256);
        if (rdAdd <= rateAdd) {
            let ev = randomMinMax(min, max);
            let rateEvent = Constants.eventRate[ev - 1];
            let rd = randomMinMax(0, 256);
            if (rd <= rateEvent && !arrEvent.includes(ev)) {
                arrEvent.push(ev);
            }
        }
    }

    return arrEvent;
}

/**Parties
 * 
 * 
 * 
 */
dbMoralis.prototype.syncNFTParties = async function (wallet) {
    try {
        let arrNFTs = await solana.getNFTs(wallet);
        // console.log(arrNFTs);
        if (arrNFTs.length > 0) {
            let parties = await this.getOne_Parties(wallet);
            if (parties) {
                let party1 = await this.syncParty(parties.get("party1"), arrNFTs);
                let party2 = await this.syncParty(parties.get("party2"), arrNFTs);
                for (let i = 0; i < arrNFTs.length; i++) {
                    let orimonster = arrNFTs[i];
                    if (!party1.includes(orimonster.tokenId) && !party2.includes(orimonster.tokenId)) {
                        let monster = await this.getMonsterByTokenId(orimonster.tokenId);
                        if (monster) {
                            party2.push(orimonster.tokenId);
                        } else {
                            let jsonMonster = await fs.readFileSync("./orimonster/" + monster.tokenId + ".json");
                            console.log(jsonMonster);
                        }
                    }
                }

                if (JSON.stringify(parties.get("party1")) != JSON.stringify(party1) || JSON.stringify(parties.get("party2")) != JSON.stringify(party2)) {
                    parties.set("party1", party1);
                    parties.set("party2", party2);
                    parties.save(null, { useMasterKey: true });
                }
            }
        }
    } catch (error) {
        console.log('syncNFTParties ' + error.message)
    }
}
dbMoralis.prototype.syncParty = async function (party, arrNFTs) {
    let p = [];
    if (party) {
        for (let i = 0; i < party.length; i++) {
            let monster = await this.getMonsterByTokenId(party[i]);
            let checkMonter = {
                tokenId: monster.tokenId,
                certification: monster.certification,
            }
            if ((monster.isNFT && arrNFTs.includes(checkMonter)) || !monster.isNFT) {
                p.push(monster.tokenId);
            }
        }
    }

    return p;
}

dbMoralis.prototype.updatePartyFromBattle = async function (wallet) {
    const query = new Moralis.Query(Parties);
    query.equalTo("wallet", wallet);
    const obj = await query.first({ useMasterKey: true });
    party1 = obj.attributes.party1;
    let temp = [];
    for (let i = 0; i < party1.length; i++) {
        if (i == (party1.length - 1)) {
            temp.push(party1[0]);
        } else {
            temp.push(party1[i + 1]);
        }
    }
    obj.set("party1", temp);
}
dbMoralis.prototype.getOrimonsBattle = async function (wallet) {
    let obj = await this.getOne_Parties(wallet);
    if (obj) {
        let party1 = [];
        for (let i = 0; i < obj.attributes.party1.length; i++) {
            let monster = await this.getMonsterByTokenId(obj.attributes.party1[i]);
            party1.push(monster);
        }
        return party1;
    }
}

dbMoralis.prototype.getOrimons = async function (wallet) {
    let obj = await this.getOne_Parties(wallet);
    if (obj) {
        let party1 = [];
        for (let i = 0; i < obj.attributes.party1.length; i++) {
            let monster = await this.getMonsterByTokenId(obj.attributes.party1[i]);
            party1.push(monster);
        }

        // await this.findMonsterByArray(obj.attributes.party1),

        let monsters = {
            party1: party1,
            party2: await this.findMonsterByArray(obj.attributes.party2)
        }
        return monsters;
    }
}

dbMoralis.prototype.swtichParty = async function (party1, party2, wallet) {
    let parties = await this.getOne_Parties(wallet);
    let p1 = parties.attributes.party1;
    let p2 = parties.attributes.party2;
    let allTokenId = p1.concat(p2);
    let isCheck = false;

    if (party1.length <= 4) {
        party1.forEach(function (tokenId) {
            if (allTokenId.includes(tokenId)) {
                isCheck = true;
            }
        });
    }

    if (party2.length > 0) {
        party2.forEach(function (tokenId) {
            if (allTokenId.includes(tokenId)) {
                isCheck = true;
            }
        });
    }

    if (isCheck) {
        const query = new Moralis.Query(Parties);
        query.equalTo("wallet", wallet);
        // const parties = new Parties();
        const obj = await query.first({ useMasterKey: true });
        if (obj) {
            obj.set("party1", party1);
            obj.set("party2", party2);
            obj.save(null, { useMasterKey: true });
        }
    }
};

/**EVsA
 * 
 * 
 * 
*/
dbMoralis.prototype.setupPVP = async function (type, user1, user2) {
    //VS1
    let userDetail_1 = await this.getOne_UserDetailByName(user1);
    let wallet_1 = userDetail_1.get('wallet');
    let parties_1 = await this.getOrimonsBattle(wallet_1);
    let limitLose_1 = 0;
    let limitWin_1 = 0;
    //VS2
    let userDetail_2 = await this.getOne_UserDetailByName(user2);
    let wallet_2 = userDetail_2.get('wallet');
    let parties_2 = await this.getOrimonsBattle(wallet_2);
    let limitLose_2 = 0;
    let limitWin_2 = 0;

    for (let i = 0; i < parties_1.length; i++) {
        let m = parties_1[i];
        if (m.curHp > 0) {
            limitLose_1++;
            limitWin_2++;
        }
    }

    for (let i = 0; i < parties_2.length; i++) {
        let m = parties_2[i];
        if (m.curHp > 0) {
            limitLose_2++;
            limitWin_1++;
        }
    }

    await this.setupBattle(type, wallet_1, JSON.stringify(parties_2[0]), limitWin_1, limitLose_1, wallet_2, wallet_2);
    await this.setupBattle(type, wallet_2, JSON.stringify(parties_1[0]), limitWin_2, limitLose_2, wallet_1, wallet_2);

    let res = {};
    res[user1] = await this.returnEnemyForClient(parties_2[0]);
    res[user2] = await this.returnEnemyForClient(parties_1[0]);
    return res;

}

dbMoralis.prototype.returnEnemyForClient = async function (e) {
    if (e.curHp > 0) {
        let enemy = {};
        enemy.level = e.level;
        enemy.mhp = getRealHP(e.mhp, e.gHp, e.trHp, e.level, e.color);
        enemy.curHp = e.curHp;
        enemy.class = e.class;
        enemy.color = e.color;
        enemy.elements = e.elements;
        enemy.hue = e.hue;
        enemy.speed = e.agi + e.gAgi;
        return enemy;
    }
}

dbMoralis.prototype.getEnemyChallenge = async function (regionId) {
    let baseMonster = await this.findEnemyByRegion(regionId);
    let newMonster = await this.getVariableMonster(baseMonster, regionId, regionId + 50);
    let level = regionId + 0;
    let enemyNoSkill = await this.initMonster(newMonster, baseMonster, level);
    let enemy = await this.setSkillMonster(enemyNoSkill, 1);
    return enemy;
}

dbMoralis.prototype.getEnemyNatural = async function (regionId) {
    let baseMonster = await this.findEnemyByRegion(regionId);
    let newMonster = await this.getVariableMonster(baseMonster, regionId, 50);
    let level = randomMinMax(regionId, regionId + 5);
    if (regionId < 5) {
        level = regionId;
    }
    let enemyNoSkill = await this.initMonster(newMonster, baseMonster, level);
    let enemy = await this.setSkillMonster(enemyNoSkill, 1);

    return enemy;
}

dbMoralis.prototype.getNewEnemy = async function (wallet) {
    const query = new Moralis.Query(EVSA);
    query.equalTo("wallet", wallet);
    const obj = await query.first({ useMasterKey: true });
    let e = {};
    if (obj.attributes.type < 2) {
        let user = await this.getOne_UserDetail(wallet);
        const regionId = user.attributes.floor;
        e = await this.getEnemyChallenge(regionId);
    } else {
        let parties = await this.getOrimons(obj.attributes.wallet);
        if (parties.party1.length > 0) {
            e = parties.party1[0].attributes;
        }
    }
    let updateData = {
        wallet: wallet,
        enemy: JSON.stringify(e),
    }
    await this.updateBattle(updateData);

    let enemy = {};
    e.mhp = e.mhp + e.gHp;

    enemy.level = e.level;

    enemy.mhp = e.mhp;
    enemy.curHp = e.curHp;
    enemy.class = e.class;
    enemy.color = e.color;
    enemy.elements = e.elements;
    enemy.hue = e.hue;

    return enemy;
}

/**
 * 
 * @param {* 0- FindMonster, 1- Challenge, 2- PVP, 3 - BetPVP , 4- Arena} type 
 * @param {*} wallet 
 * @param {*} enemy 
 * @param {*} limitWin 
 * @param {*} limitLose 
 */
dbMoralis.prototype.setupBattle = async function (type, wallet, enemy, limitWin, limitLose, opponentWallet, player2) {
    const evsa = {
        wallet: wallet,
        enemy: enemy,
        win: 0,
        lose: 0,
        limitWin: limitWin,
        limitLose: limitLose,
        type: type,
        eSkill: 0,
        opponentWallet: opponentWallet,
        player2: player2,
    }
    // console.log(evsa);

    const query = new Moralis.Query(EVSA);
    query.equalTo("wallet", wallet);
    const obj = await query.first({ useMasterKey: true });
    if (obj) {
        await Object.keys(evsa).forEach(function (key) {
            obj.set(key, evsa[key]);
        });
        obj.save(null, { useMasterKey: true });
    } else {
        const mEVSA = new EVSA();
        try {
            mEVSA.save(evsa, { useMasterKey: true });
        } catch (error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    }
}

dbMoralis.prototype.changeActorPVP = async function (wallet) {
    let myEvsa = await this.getOne_EVSA(wallet);
    let party1 = await this.getOrimonsBattle(wallet);

    let opponentWallet = myEvsa.get('opponentWallet');
    // console.log(party1[0]);
    let update = {
        wallet: opponentWallet,
        enemy: JSON.stringify(party1[0])
    };
    await this.updateBattle(update);
}

/**
 * 
 * @param {*} player1 //First
 * @param {*} player2 //Second
 * @param {*} skill1 
 * @param {*} skill2 
 * @param {*} evsa1 
 * @param {*} evsa2 
 */
dbMoralis.prototype.fightingPVP = async function (player1, player2, skill1, skill2, evsa1, evsa2) {
    let monster1 = {};
    let monster2 = {};

    //Coppy data
    await Object.keys(player1).forEach(function (key) {
        monster1[key] = player1[key];
    });

    await Object.keys(player2).forEach(function (key) {
        monster2[key] = player2[key];
    });

    if (monster1.skills[skill1] <= 0) {
        skill1 = 222;
    }

    if (monster2.skills[skill2] <= 0) {
        skill2 = 222;
    }

    let oriMon1 = await getRealAttr(player1);
    let oriMon2 = await getRealAttr(player2);

    let Result1 = await getFightingResult(skill1, oriMon1, oriMon2);
    let Result2 = await getFightingResult(skill2, oriMon2, oriMon1);

    let btResult1 = {};
    let btResult2 = {};

    //checkSpeed
    if (Result1.speed > Result2.speed) {
        oriMon2.curHp = oriMon2.curHp - Result1.damage;
        if (oriMon2.curHp > 0) {
            oriMon1.curHp = oriMon1.curHp - Result2.damage;
        } else {
            oriMon2.curHp = 0;
            Result2.damage = 0;
            Result2.miss = true;
            Result2.crit = false;

            evsa1.set("win", evsa1.get('win') + 1);
            evsa2.set("lose", evsa2.get('lose') + 1);
            // btResult1.endRound = true;
            btResult1.status = Constants.WIN;

            // btResult2.endRound = true;
            btResult2.status = Constants.LOSE;

            if (evsa1.get('limitWin') == evsa1.get('win')) {
                btResult1.status = Constants.VICTORY;
                btResult2.status = Constants.DEFEAT;
            }
        }
    } else {
        oriMon1.curHp = oriMon1.curHp - Result2.damage;
        if (oriMon1.curHp > 0) {
            oriMon2.curHp = oriMon2.curHp - Result1.damage;
        } else {
            oriMon1.curHp = 0;
            Result1.damage = 0;
            Result1.crit = false;
            Result1.miss = true;

            evsa2.set("win", evsa2.get('win') + 1);
            evsa1.set("lose", evsa1.get('lose') + 1);
            // btResult1.endRound = true;
            btResult1.status = Constants.LOSE;

            // btResult2.endRound = true;
            btResult2.status = Constants.WIN;

            if (evsa2.get('limitWin') == evsa2.get('win')) {
                // btResult2.endBattle = true;
                btResult2.status = Constants.VICTORY;

                // btResult1.endBattle = true;
                btResult1.status = Constants.DEFEAT;
            }
        }
    }

    //save evsa
    if (oriMon1.curHp <= 0) {
        oriMon1.curHp = 0;
    }
    if (oriMon2.curHp <= 0) {
        oriMon2.curHp = 0;
    }

    monster2.curHp = oriMon2.curHp;
    Result2.curHp = monster2.curHp;
    Result2.skillId = skill2;
    evsa1.set('enemy', JSON.stringify(monster2));
    evsa1.set('eSkill', 0);
    evsa1.save(null, { useMasterKey: true });

    monster1.curHp = oriMon1.curHp;
    Result1.curHp = monster1.curHp;
    Result1.skillId = skill1;
    evsa2.set('enemy', JSON.stringify(monster1));
    evsa2.set('eSkill', 0);
    evsa2.save(null, { useMasterKey: true });

    //save monster
    if (skill1 != 222) {
        monster1.skills[skill1] = monster1.skills[skill1] - 1;
    }

    if (skill2 != 222) {
        monster2.skills[skill2] = monster2.skills[skill2] - 1;
    }

    let updateMonster1 = {
        tokenId: monster1.tokenId,
        curHp: monster1.curHp,
        skills: monster1.skills
    }

    let updateMonster2 = {
        tokenId: monster2.tokenId,
        curHp: monster2.curHp,
        skills: monster2.skills
    }
    await this.update_Monster(updateMonster1);
    await this.update_Monster(updateMonster2);
    return [[Result1, Result2, btResult1], [Result2, Result1, btResult2]];
}

dbMoralis.prototype.fighting = async function (wallet, monster, mSkillId, typeSelected, signature) {
    try {
        // const queryEVSA = new Moralis.Query(EVSA);
        // queryEVSA.equalTo("wallet", wallet);
        // let evs = await query.first({ useMasterKey: true });
        let evs = await this.getOne_EVSA(wallet);
        let battle = evs.attributes;

        let eSkill = {};
        let enemy = JSON.parse(battle.enemy);
        let enemyMon = await getRealAttr(enemy);
        let oriMon = await getRealAttr(monster);

        if (battle.type == 1 || battle.type == 0) {
            let rd = randomMinMax(0, enemy.elementSkill.length - 1);
            eSkill = enemy.elementSkill[rd];
        }

        //get enemyResult
        let eResult = await getFightingResult(eSkill, enemyMon, oriMon);
        if (eResult) {
            let mResult = {};
            let btResult = {};
            let skills = monster.skills;
            btResult.effect = { type: '' };
            if (typeSelected == 0) {
                let limitSkill = 10;
                if (mSkillId != 222) {
                    limitSkill = monster.skills[mSkillId];
                    skills[mSkillId] = monster.skills[mSkillId] - 1;
                }
                if (limitSkill > 0) {
                    let mSkill = await this.getSkillById(mSkillId);
                    mResult = await getFightingResult(mSkill, oriMon, enemyMon);
                }
            } else {
                let user = await this.getOne_UserDetail(wallet);
                let items = JSON.parse(user.get('items'));
                let limitItem = items[mSkillId];

                if (limitItem > 0) {
                    mResult = {
                        damage: 0,
                        miss: false,
                        speed: 9 * 10 ** 18,
                        crit: false,
                        curHp: oriMon.curHp
                    }
                    btResult.effect = await this.useItem(mSkillId, monster, enemy, signature, wallet);
                }
            }

            //formula
            eResult.skillId = eSkill.skillId;
            if (btResult.effect) {
                if (btResult.effect.rate) {
                    oriMon.curHp = parseInt(oriMon.curHp + oriMon.mhp * btResult.effect.rate / 100);
                    if (oriMon.curHp > oriMon.mhp) {
                        oriMon.curHp = oriMon.mhp;
                    }
                }
                if (btResult.effect.type == 'catch' && btResult.effect.shake3) {
                    mResult.curHp = monster.curHp;
                    eResult.skillId = 0;
                    btResult.endBattle = true;
                    btResult.status = 'catch';
                    // console.log(btResult.effect.monster.tokenId);
                    let parties = await this.getOne_Parties(wallet);
                    parties.get('party2').push(btResult.effect.monster.tokenId);
                    parties.save(null, { useMasterKey: true });
                    // await this.addMonsterToParties(wallet, btResult.effect.monster.tokenId);
                }
            }

            // CheckSpeed
            if (mResult.speed > eResult.speed) {
                enemyMon.curHp = enemyMon.curHp - mResult.damage;
                if (enemyMon.curHp > 0) {
                    oriMon.curHp = oriMon.curHp - eResult.damage;
                } else {
                    enemyMon.curHp = 0;
                    eResult.damage = 0;
                    eResult.miss = true;
                    eResult.crit = false;
                }
            } else {
                oriMon.curHp = oriMon.curHp - eResult.damage;
                if (oriMon.curHp > 0) {
                    enemyMon.curHp = enemyMon.curHp - mResult.damage;
                } else {
                    oriMon.curHp = 0;
                    mResult.damage = 0;
                    mResult.crit = false;
                    if (typeSelected == 0) {
                        mResult.miss = true;
                    }
                }
            }

            enemy.curHp = enemyMon.curHp;
            evs.set("enemy", JSON.stringify(enemy));

            mResult.curHp = oriMon.curHp;
            eResult.curHp = enemyMon.curHp;
            let dataUpdate = {
                tokenId: monster.tokenId,
                curHp: mResult.curHp,
                skills: skills
            }
            await this.update_Monster(dataUpdate);

            //Battle result
            if (enemy.curHp <= 0) {
                eResult.curHp = 0;
                evs.set("win", battle.win + 1);
                // btResult.endRound = true;
                btResult.status = 'win';
                if (battle.limitWin == evs.attributes.win) {
                    // btResult.endBattle = true;
                    btResult.status = 'victory';
                }
            }
            if (oriMon.curHp <= 0) {
                mResult.curHp = 0;
                evs.set("lose", battle.lose + 1);
                // btResult.endRound = true;
                btResult.status = 'lose';
                if (battle.limitLose == evs.attributes.lose) {
                    // btResult.endBattle = true;
                    btResult.status = 'defeat';
                }
            }

            evs.save(null, { useMasterKey: true });
            if (btResult.status == 'victory') {
                await this.update_UserDetail({ wallet: wallet, busy: false });
                btResult.rewards = await this.getReward(battle.type, wallet, enemy, oriMon.tokenId);
            }

            return [mResult, eResult, btResult];
        }
    } catch (error) {
        console.log("fighting " + error.code + " " + error.message);
    }
}

dbMoralis.prototype.useItem = async function (itemId, monster, enemy, signature, wallet) {
    let verify = false;
    if (signature != '') {
        verify = await network.checkSignature(signature, 'transfer', 1, wallet, constNW.accountSoulStone);
    }
    // console.log(verify);

    let item = await this.getOne_Items(itemId);
    // console.log(item.get('enum'));
    let itemInfo = item.get('enum');
    let note = itemInfo.note.trim();
    let res = {};
    let userDetail = await this.getOne_UserDetail();
    switch (itemInfo.type.trim()) {
        case 'catch':
            if (verify) {
                res = await this.catchMonster(parseInt(note), enemy, wallet);
            }
            break;
        case 'chest':
            res = await this.getChest();
            break;
        case 'gain':
            if (monster.training < 256) {
                res = await this.gainMonster(note, monster);
            }
            break;
        case 'upgrade':
            res = await this.upgradeMonster(parseInt(note), monster);
            break;
        case 'heal':
            res = await this.heal(parseInt(note), monster);
            break;
        case 'healAll':
            res = await this.healAll(wallet, parseInt(note), false);
            break;
        case 'learn':
            res = await this.learnSkill(parseInt(note), monster);
            break;
        case 'coppy':
            if (verify) {
                res = await this.coppy(monster);
            }
            break;
        case 'levelUp':
            if (verify) {
                res = await this.levelUp(monster);
            }
            break;
        default:
            break;
    }
    let user = await this.getOne_UserDetail(wallet);
    let items = JSON.parse(user.get('items'));
    let limitItem = items[itemId];
    items[itemId] = limitItem - 1;
    let updateUser = {
        wallet: wallet,
        items: JSON.stringify(items),
    }
    this.update_UserDetail(updateUser);
    return res;
}
dbMoralis.prototype.catchMonster = async function (itemRate, e, wallet) {
    let rd1 = randomMinMax(0, 100);
    let rd2 = randomMinMax(0, 100);
    let rd3 = randomMinMax(0, 100);
    let actor = await this.get_ActorbyClass(e.class);
    let monsterRate = actor.weight;
    let maxHp = getRealHP(e.mhp, e.gHp, e.trHp, e.level, e.color);
    let rate = (((3 * maxHp - 2 * e.curHp) * (monsterRate / 100)) / (3 * maxHp)) * 100;
    let shake1 = (rd1 < rate);
    let shake2 = false;
    let shake3 = false;
    if (itemRate == 100) {
        shake1 = true;
        shake2 = true;
        shake3 = true;
    } else {
        if (shake1) {
            shake2 = (rd2 < itemRate);
        }
        if (shake2) {
            shake3 = (rd3 < (rate + itemRate) / 2);
        }
    }
    if (shake1 && shake2 && shake3) {
        let tokenId = await this.getTokenId();
        await this.AddUpdate_System({ totalToken: tokenId + 1 });
        let baseActor = await this.get_ActorbyClass(e.class);
        // let newMonster = await this.getVariableMonster(baseActor, 0, 50);
        let variableActor = {
            designer: e.designer,
            name: e.name,
            class: e.class,
            gHp: e.gHp,
            gAtk: e.gAtk,
            gDef: e.gDef,
            gMat: e.gMat,
            gMdf: e.gMdf,
            gAgi: e.gAgi,
            gifted: e.gifted,
            hue: e.hue,
            elements: e.elements
        }
        let monsterNoSkill = await this.initMonster(variableActor, baseActor, 1);
        let monster = await this.createNFT(tokenId, monsterNoSkill, wallet);
        monster.level = e.level;
        monster.evo = e.evo;
        monster.curExp = expForLevel(monster.level);
        monster.color = e.color;
        monster.curHp = getRealHP(m.mhp, m.gHp, m.trHp, m.level, m.color);
        await this.update_Monster(monster);
        return { type: 'catch', shake1: shake1, shake2: shake2, shake3: shake3, monster: monster };
    } else {
        return { type: 'catch', shake1: shake1, shake2: shake2, shake3: shake3 };
    }
}
dbMoralis.prototype.gainMonster = async function (note, monster) {
    let update = {};
    switch (note) {
        case 'Hp':
            update.trHp = monster.trHp + 1;
            break;
        case 'Atk':
            update.trAtk = monster.trAtk + 1;
            break;

        case 'Def':
            update.trDef = monster.trDef + 1;
            break;
        case 'Mat':
            update.trMat = monster.trMat + 1;
            break;
        case 'Mdf':
            update.trMdf = monster.trMdf + 1;
            break;
        case 'Agi':
            update.trAgi = monster.trAgi + 1;
            break;
    }
    update.tokenId = monster.tokenId;
    update.training = monster.training + 1;
    await this.update_Monster(update);
}
dbMoralis.prototype.upgradeMonster = async function (note, monster) {
    if (note == monster.color) {
        let update = {};
        update.tokenId = monster.tokenId;
        update.color = monster.color + 1;
        await this.update_Monster(update);
    }
}
dbMoralis.prototype.heal = async function (note, m) {
    let res = {};
    let monster = {};
    let mhp = getRealHP(m.mhp, m.gHp, m.trHp, m.level, m.color);
    let recoverHp = m.curHp + (note * mhp / 100);
    if (recoverHp > mhp) {
        recoverHp = mhp;
    }
    if (m.curHp > 0) {
        monster.curHp = parseInt(recoverHp);
        monster.tokenId = m.tokenId;
        await this.update_Monster(monster);
        return { type: 'heal', rate: note, code: 200 };
    }
    return res;

}

dbMoralis.prototype.healAll = async function (wallet, note, resetSkill) {
    let parties = await this.getOne_Parties(wallet);
    let party1 = parties.get("party1");
    for (let i = 0; i < party1.length; i++) {
        let monster = {};
        let m = await this.getMonsterByTokenId(party1[i]);
        let mhp = getRealHP(m.mhp, m.gHp, m.trHp, m.level, m.color);
        let recoverHp = m.curHp + (note * mhp / 100);
        if (recoverHp > mhp || note == 100) {
            recoverHp = mhp;
        }
        if (resetSkill) {
            monster.curHp = parseInt(recoverHp);
            monster.tokenId = m.tokenId;
            // console.log(monster);

            monster.skills = m.skills;
            await Object.keys(monster.skills).forEach(function (key) {
                monster.skills[key] = 10;
            });
            await this.update_Monster(monster);
        } else {
            if (m.curHp > 0) {
                monster.curHp = parseInt(recoverHp);
                monster.tokenId = m.tokenId;
                // console.log(monster);
                await this.update_Monster(monster);
            }
        }
    }
    return { type: 'healAll', rate: note, code: 200 };
}
dbMoralis.prototype.learnSkill = async function (monster) {

}

dbMoralis.prototype.escapse = async function (wallet) {
    let obj = {
        wallet: wallet,
        enemy: '',
        limitLose: 0,
        limitWin: 0,
        win: 0,
        lose: 0
    };
    this.updateBattle(obj);
    this.update_UserDetail({ wallet: wallet, busy: false });
}

/**Reward
 * 
 * 
 * 
*/

dbMoralis.prototype.getReward = async function (type, wallet, enemy, tokenId) {
    let orimonster = await this.getMonsterByTokenId(tokenId);
    let reward = {};
    switch (type) {
        case 0://Fight natural monster
            reward = await this.getRewardHunter(wallet, enemy, orimonster);
            break;
        case 1://Challenge
            reward = await this.getRewardChallenge(wallet);
            break;
        case 2:// PVP
            break;
        case 3://BET PVP
            break;
        case 4:// Arena
            break;
        default:
            break;
    }
    return reward;
}

/**
 * exp, item, token.
 */
dbMoralis.prototype.getRewardHunter = async function (wallet, enemy, monster) {

    let reward = {};
    let rdSS = randomMinMax(0, 100);
    let rdOrit = randomMinMax(0, 100);
    let rdItem = randomMinMax(0, 100);
    if (rdSS < 10) {
        let soulstone = randomMinMax(0, enemy.level);
        reward.soulstone = soulstone;
        cmd.transfer(constNW.addressSoulStone, wallet, 1);
    }

    if (rdOrit == 100) {
        let orit = Math.random();
        reward.orit = orit;
        cmd.transfer(constNW.addressORIT, wallet, orit);
    }

    if (rdItem < 10) {
        let item = randomMinMax(1, Constants.reward.max);
        let rate = Constants.reward['item' + item];
        let rd = randomMinMax(0, 100);
        if (rd <= rate) {
            reward.items = [{ item: item, quantity: 1 }];
        }
    }

    reward.exp = enemy.level * Constants.EXP_FINDMONSTER;
    let orimonster = await this.growExp(monster, reward.exp);
    // reward.monster = orimonster;
    return reward;
}

dbMoralis.prototype.getRewardChallenge = async function (wallet) {
    try {
        let reward = {};
        let user = await this.getOne_UserDetail(wallet);
        const regionId = user.attributes.floor;
        reward.orit = regionId / 5;
        reward.soulstone = regionId;

        cmd.transfer(constNW.addressORIT, wallet, reward.orit);
        cmd.transfer(constNW.addressSoulStone, wallet, reward.soulstone);

        let arrItems = await this.createItemsDrop(regionId);
        // let arrSkillBooks = await this.createSkillBookDrop(regionId);
        let rdItem = randomMinMax(0, arrItems.length - 1);
        // let rdBSkill = randomMinMax(0, arrSkillBooks.length - 1);

        let itemId = arrItems[rdItem];
        // let bookSkillId = arrSkillBooks[rdBSkill];

        reward.items = [];
        let items = {};
        if (user.get('items') != '') {
            let itemsDB = JSON.parse(user.get("items"));//Error
            await Object.keys(itemsDB).forEach(function (key) {
                items[key] = itemsDB[key];
                // actor.set(key, monster[key]);
            });
        }


        reward.items.push({ item: itemId, quantity: 1 });
        if (items[itemId]) {
            items[itemId] = items[itemId] + 1;
        } else {
            items[itemId] = 1;
        }


        // reward.items.push({ item: bookSkillId, quantity: 1 });
        // if (items[bookSkillId]) {
        //     items[bookSkillId] = items[bookSkillId] + 1;
        // } else {
        //     items[bookSkillId] = 1;
        // }


        console.log(items);


        reward.exp = regionId * Constants.EXP_CHALLENGE;
        await this.growExpParty(wallet, reward.exp);

        let updatedata = {
            map: regionId + 1,
            floor: regionId + 1,
            wonFloor: regionId + 1,
            items: JSON.stringify(items),
            wallet: wallet
        };
        await this.update_UserDetail(updatedata);
        return reward;
    } catch (error) {
        console.log("getRewardChallenge -" + "Error:" + error.message);
    }
}
dbMoralis.prototype.createItemsDrop = async function (regionId) {
    let listItems = [];
    for (let i = 1; i <= Constants.reward.max; i++) {
        let name = 'item' + i;
        let n = Constants.reward[name];
        if (n != 1) {
            for (let j = 1; j <= n; j++) {
                listItems.push(i);
            }
        } else if (n == 1 && regionId > 50) {
            listItems.push(i);
        }
    }
    return shuffle(listItems);
}

dbMoralis.prototype.createSkillBookDrop = async function (regionId) {
    let listItems = [];
    for (let i = 100; i <= 220; i++) {
        let name = 'item' + i;
        let n = Constants.reward[name];
        for (let j = 1; j <= n; j++) {
            listItems.push(i);
        }
    }
    return shuffle(listItems);
}


dbMoralis.prototype.growExp = async function (monster, exp) {
    let actor = {};
    await Object.keys(monster).forEach(function (key) {
        actor[key] = monster[key];
        // actor.set(key, monster[key]);
    });
    if (actor.curHp > 0) {
        actor.curExp = actor.curExp + exp;
        if (actor.curExp >= expForLevel(actor.level + 1)) {
            actor.level++;
            actor.mhp = actor.mhp + parseInt(actor.mhp / 5 + actor.gHp);
            actor.atk = actor.atk + parseInt(actor.atk / 5 + actor.gAtk);
            actor.def = actor.def + parseInt(actor.def / 5 + actor.gDef);
            actor.mat = actor.mat + parseInt(actor.mat / 5 + actor.gMat);
            actor.mdf = actor.mdf + parseInt(actor.mdf / 5 + actor.gMdf);
            actor.agi = actor.agi + parseInt(actor.agi / 5 + actor.gAgi);
        }
    }

    await this.update_Monster(actor);
    return actor;
}

dbMoralis.prototype.growExpParty = async function (wallet, exp) {
    let parties = await this.getOne_Parties(wallet);

    let party1 = parties.attributes.party1;
    if (party1.length > 0) {
        for (let i = 0; i < party1.length; i++) {
            let actor = await this.getMonsterByTokenId(party1[i]);
            await this.growExp(actor, exp);
        }
    }
}

/**========================================================================================================================================
 * Market Place
 * 
 * 
 * 
 * 
 * ========================================================================================================================================
*/
dbMoralis.prototype.sellItem = async function (wallet, data) {

    if (data.itemType == "Item") {
        let user = await this.getOne_UserDetail(wallet);
        let items = JSON.parse(user.get("items"));
        if (items[data.itemId] > 0) {
            console.log("can sell");
            let obj = await this.checkItemExistMKP(wallet, data);
            if (obj == undefined) {
                await this.addToMKP(wallet, data);
            } else {
                obj.set("quantity", obj.get("quantity") + data.quantity)
                obj.save(null, { useMasterKey: true });
            }


            items[data.itemId] = items[data.itemId] - data.quantity;
            user.set("items", JSON.stringify(items));
            user.save(null, { useMasterKey: true });
        }
    } else if (data.itemType == "Orimonster") {
        let parties = await this.getOne_Parties(wallet);
        let party1 = parties.get("party1");
        let party2 = parties.get("party2");
        if (party1.includes(data.itemId) || party2.includes(data.itemId)) {
            await this.addToMKP(wallet, data);

            if (party1.includes(data.itemId)) {
                const index = party1.indexOf(data.itemId);
                if (index > -1) {
                    party1.splice(index, 1); // 2nd parameter means remove one item only
                }
                parties.set("party1", party1);
            } else if (party2.includes(data.itemId)) {
                const index = party2.indexOf(data.itemId);
                if (index > -1) {
                    party2.splice(index, 1); // 2nd parameter means remove one item only
                }
                parties.set("party2", party2);
            }
            parties.save(null, { useMasterKey: true });
        }
    }
}

dbMoralis.prototype.addToMKP = async function (wallet, data) {
    let obj = new MarketPlace();
    obj.set("wallet", wallet);
    await Object.keys(data).forEach(function (key) {
        obj.set(key, data[key]);
    });
    obj.save(null, { useMasterKey: true });
}

dbMoralis.prototype.checkItemExistMKP = async function (wallet, data) {
    const query = new Moralis.Query(MarketPlace);
    query.equalTo("wallet", wallet);
    let obj = await query.first({ useMasterKey: true });

    if (obj) {
        let itemId = obj.get("itemId");
        let itemType = obj.get("itemType");
        let typeToken = obj.get("typeToken");
        let price = obj.get("price");

        if (itemId == data.itemId && itemType == data.itemType && typeToken == data.typeToken && price == data.price) {
            return obj;
        } else return undefined;
    }
}

//=============================================================================
/**
 * Class User
 */
const User = Moralis.Object.extend("User");
dbMoralis.prototype.createUser = async function (data) {
    let user = new User();
    let username = data.wallet.substring(0, 5) + "..." + data.wallet.substring(data.wallet.length - 5);
    let savedata = {
        wallet: data.wallet,
        username: username,
        password: data.password
    }
    // user.set("wallet", data.wallet);
    // user.set("username", username);
    // user.set("password", data.password);
    try {
        user.save(savedata, { useMasterKey: true });
        return user;
    } catch (error) {
        console.log("createUser: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getUser = async function (wallet) {
    const query = new Moralis.Query(User);
    query.equalTo("solAddress", wallet);
    try {
        let obj = await query.first({ useMasterKey: true });
        return obj;
    } catch (error) {
        console.log("getUser: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getUserByUsername = async function (username) {
    const query = new Moralis.Query(User);
    query.equalTo("username", username);
    try {
        let obj = await query.first({ useMasterKey: true });
        return obj;
    } catch (error) {
        console.log("getUser: " + error.code + " " + error.message);
    }
}
//=============================================================================
/**
 * Class UserDetail
 */
const UserDetail = Moralis.Object.extend("UserDetail");
dbMoralis.prototype.add_UserDetail = async function (data) {
    const obj = new UserDetail();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_UserDetail: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.update_UserDetail = async function (data) {
    const query = new Moralis.Query(UserDetail);
    query.equalTo("wallet", data.wallet);
    try {
        let obj = await query.first({ useMasterKey: true });
        if (obj) {
            await Object.keys(data).forEach(function (key) {
                obj.set(key, data[key]);
            });
            await obj.save(null, { useMasterKey: true });
        }
    } catch (error) {
        console.log("update_UserDetail: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getOne_UserDetail = async function (wallet) {
    const query = new Moralis.Query(UserDetail);
    query.equalTo("wallet", wallet);
    try {
        let obj = await query.first({ useMasterKey: true });
        return obj;
    } catch (error) {
        console.log("getOne_UserDetail: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getOne_UserDetailByName = async function (name) {
    const query = new Moralis.Query(UserDetail);
    query.equalTo("username", name);
    try {
        let obj = await query.first({ useMasterKey: true });
        return obj;
    } catch (error) {
        console.log("getOne_UserDetail: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getAll_UserDetail = async function () {
    const query = new Moralis.Query(UserDetail);
    try {
        let obj = await query.find({ useMasterKey: true });
        return obj;
    } catch (error) {
        console.log("getAll_UserDetail: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.delete_UserDetail = async function () {

}
//=============================================================================
/**
 * Class Monster
 */
const Monster = Moralis.Object.extend("Monster");
dbMoralis.prototype.add_Monster = async function (data) {
    const obj = new Monster();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_Monster: " + error.code + " " + error.message);
    }
}

dbMoralis.prototype.update_Monster = async function (data) {
    const query = new Moralis.Query(Monster);
    query.equalTo("tokenId", data.tokenId);
    let monster = await query.first({ useMasterKey: true });
    await Object.keys(data).forEach(function (key) {
        monster.set(key, data[key]);
    });
    monster.save(null, { useMasterKey: true });

}
dbMoralis.prototype.getOne_Monster = async function () {

}
dbMoralis.prototype.getAll_Monster = async function () {

}
dbMoralis.prototype.delete_Monster = async function () {

}
//=============================================================================
/**
 * Class Actor
 */
const Actor = Moralis.Object.extend("Actor");
dbMoralis.prototype.add_Actor = async function (data) {
    const obj = new Actor();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_Actor: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.update_Actor = async function () {

}
dbMoralis.prototype.get_Actor = async function (index) {
    const query = new Moralis.Query(Actor);
    query.equalTo("index", index);
    const obj = await query.first({ useMasterKey: true });
    const data = obj.attributes;
    return data;
}
dbMoralis.prototype.get_ActorbyClass = async function (_class) {
    const query = new Moralis.Query(Actor);
    query.equalTo("class", _class);
    const obj = await query.first({ useMasterKey: true });
    const data = obj.attributes;
    return data;
}

dbMoralis.prototype.getAll_Actor = async function () {

}
dbMoralis.prototype.delete_Actor = async function () {

}
//=============================================================================
/**
 * Class Items
 */
const Items = Moralis.Object.extend("Items");
dbMoralis.prototype.add_Items = async function (data) {
    const obj = new Items();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_Items: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.update_Items = async function () {

}
dbMoralis.prototype.getOne_Items = async function (itemId) {
    const query = new Moralis.Query(Items);
    query.equalTo("itemId", itemId);
    try {
        let obj = await query.first({ useMasterKey: true });
        return obj;
    } catch (error) {
        console.log("getOne_Items: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getAll_Items = async function () {

}
dbMoralis.prototype.delete_Items = async function () {

}
//=============================================================================
/**
 * Class Skill
 */
const Skill = Moralis.Object.extend("Skill");
dbMoralis.prototype.add_Skill = async function (data) {
    const obj = new Skill();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_Skill: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.update_Skill = async function () {

}
dbMoralis.prototype.getOne_Skill = async function () {

}
dbMoralis.prototype.getAll_Skill = async function () {

}
dbMoralis.prototype.delete_Skill = async function () {

}
//=============================================================================
/**
 * Class Map
 */
const Map = Moralis.Object.extend("Map");
dbMoralis.prototype.add_Map = async function (data) {
    const obj = new Map();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_Map: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.update_Map = async function () {

}
dbMoralis.prototype.getOne_Map = async function () {

}
dbMoralis.prototype.getAll_Map = async function () {

}
dbMoralis.prototype.delete_Map = async function () {

}
//=============================================================================
/**
 * Class Parties
 */
const Parties = Moralis.Object.extend("Parties");
dbMoralis.prototype.add_Parties = async function (data) {
    const obj = new Parties();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_Parties: " + error.code + " " + error.message);
    }
}

dbMoralis.prototype.addMonsterToParties = async function (wallet, tokenId) {
    let parties = await this.getOne_Parties(wallet);
    if (parties) {
        if (parties.attributes.party1.length < 4) {
            parties.attributes.party1.push(tokenId);
        } else {
            parties.attributes.party2.push(tokenId);
        }
        parties.save(null, { useMasterKey: true });
    } else {
        parties = new Parties();
        const p = {
            wallet: wallet,
            party1: [tokenId],
            party2: [],
        };
        await parties.save(p, { useMasterKey: true });
    }
}

dbMoralis.prototype.update_Parties = async function (data) {

}

dbMoralis.prototype.getOne_Parties = async function (wallet) {
    const query = new Moralis.Query(Parties);
    query.equalTo("wallet", wallet);
    const obj = await query.first({ useMasterKey: true });
    if (obj) {
        return obj;
    }
}
dbMoralis.prototype.getAll_Parties = async function () {
    const query = new Moralis.Query(Parties);
    const obj = await query.find({ useMasterKey: true });
    if (obj) {
        return obj;
    }
}
dbMoralis.prototype.delete_Parties = function () {

}
//=============================================================================
/**
 * Class EVSA
 */
const EVSA = Moralis.Object.extend("EVSA");
dbMoralis.prototype.add_EVSA = async function (data) {
    const obj = new EVSA();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_EVSA: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.updateBattle = async function (data) {
    try {
        const query = new Moralis.Query(EVSA);
        query.equalTo("wallet", data.wallet);
        let obj = await query.first({ useMasterKey: true });
        if (obj) {
            await Object.keys(data).forEach(function (key) {
                obj.set(key, data[key]);
            });
            obj.save(null, { useMasterKey: true });
        }

    } catch (error) {
        console.log("updateBattle: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getOne_EVSA = async function (wallet) {
    try {
        const query = new Moralis.Query(EVSA);
        query.equalTo("wallet", wallet);
        return await query.first({ useMasterKey: true });
    } catch (error) {
        console.log("getOne_EVSA: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getSubscribe_EVSA = async function (wallet) {
    const query = new Moralis.Query(EVSA);
    query.equalTo("wallet", wallet);
    return query.subscribe();
}

dbMoralis.prototype.get_EVSAByOpponent = async function (wallet) {
    try {
        let myEvsa = await this.getOne_EVSA(wallet);
        let opponentWallet = myEvsa.get('opponentWallet');
        return await this.getOne_EVSA(opponentWallet);
    } catch (error) {
        console.log("get_EVSAByOpponent: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getAll_EVSA = async function () {

}
dbMoralis.prototype.delete_EVSA = async function () {

}

//=============================================================================
/**
 * Class ARENA
 */
const ARENA = Moralis.Object.extend("ARENA");
dbMoralis.prototype.add_ARENA = async function (data) {
    const obj = new ARENA();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_ARENA: " + error.code + " " + error.message);
    }
}

dbMoralis.prototype.update_ARENA = async function (data) {
    try {
        const query = new Moralis.Query(ARENA);
        query.equalTo("wallet", data.wallet);
        let obj = await query.first({ useMasterKey: true });
        if (obj) {
            await Object.keys(data).forEach(function (key) {
                obj.set(key, data[key]);
            });
            obj.save(null, { useMasterKey: true });
        }

    } catch (error) {
        console.log("update_ARENA: " + error.code + " " + error.message);
    }
}

dbMoralis.prototype.getOne_ARENA = async function (wallet) {
    try {
        const query = new Moralis.Query(ARENA);
        query.equalTo("wallet", wallet);
        return await query.first({ useMasterKey: true });
    } catch (error) {
        console.log("getOne_ARENA: " + error.code + " " + error.message);
    }
}

dbMoralis.prototype.Find_ARENA = async function (status, points) {
    try {
        let min = 1000;
        for (let i = 0; i < 10; i++) {
            if (points < min + 500) {
                break;
            } else {
                min = min + 500;
            }
        }
        const query = new Moralis.Query(ARENA);
        query.equalTo("status", status);
        query.greaterThanOrEqualTo("points", min);
        query.lessThan("points", min + 500);
        return await query.first({ useMasterKey: true });
    } catch (error) {
        console.log("getOne_ARENA: " + error.code + " " + error.message);
    }
}

//=============================================================================
/**
 * Class BlockChainLogs
 */
const BlockChainLogs = Moralis.Object.extend("BlockChainLogs");
dbMoralis.prototype.add_BlockChainLogs = async function (type, authority, signatureReq, tokenReq, tokenRes, tokenId) {
    try {
        const logs = new BlockChainLogs();
        logs.set("type", type);
        logs.set('authority', authority);
        logs.set('signatureReq', signatureReq);
        logs.set('tokenReq', tokenReq);
        logs.set('tokenRes', tokenRes);
        logs.set('tokenId', tokenId);
        logs.save(null, { useMasterKey: true });
    } catch (error) {
        console.log("errFunction - add_BlockChainLogs: " + error.message);
    }
}

//=============================================================================
/**
 * Class System
 */
const System = Moralis.Object.extend("System");

dbMoralis.prototype.AddUpdate_System = async function (data) {
    const query = new Moralis.Query(System);
    let system = await query.first({ useMasterKey: true });
    if (!system) {
        system = new System();
    }
    await Object.keys(data).forEach(function (key) {
        system.set(key, data[key]);
    });
    try {
        system.save(null, { useMasterKey: true });
    } catch (error) {
        console.log("AddUpdate_System: " + error.message);
    }
}

dbMoralis.prototype.getTokenId = async function () {
    const query = new Moralis.Query(System);
    const obj = await query.first({ useMasterKey: true });
    if (obj) {
        return obj.attributes.totalToken;
    }
    return 0;
}

dbMoralis.prototype.getOne_System = async function () {
    const query = new Moralis.Query(System);
    const obj = await query.first({ useMasterKey: true });
    if (obj) {
        return obj
    }
}
//=============================================================================
/**
 * Class MarketPlace
 */
const MarketPlace = Moralis.Object.extend("MarketPlace");
dbMoralis.prototype.add_MarketPlace = async function (data) {
    const obj = new MarketPlace();
    try {
        obj.save(data, { useMasterKey: true });
    } catch (error) {
        console.log("add_MarketPlace: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.update_MarketPlace = async function (data) {
    const query = new Moralis.Query(MarketPlace);
    query.equalTo("wallet", data.wallet);
    try {
        let obj = await query.first({ useMasterKey: true });
        await Object.keys(data).forEach(function (key) {
            obj.set(key, data[key]);
        });
        await obj.save(null, { useMasterKey: true });
    } catch (error) {
        console.log("update_MarketPlace: " + error.code + " " + error.message);
    }
}
dbMoralis.prototype.getOne_MarketPlace = async function () {

}
dbMoralis.prototype.getAll_MarketPlace = async function () {

}
dbMoralis.prototype.delete_MarketPlace = async function () {

}


/**========================================================================================================================================
 * User Function
 * 
 * 
 * 
 * 
 * ========================================================================================================================================
*/

/**========================================================================================================================================
 * Battle Function
 * 
 * 
 * 
 * 
 * ========================================================================================================================================
*/

/**========================================================================================================================================
 * Event Function
 * 
 * 
 * 
 * 
 * ========================================================================================================================================
*/

function randomMinMax(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function drawImage(monster, path) {//TODO need fix
    const image = await Jimp.read(Constants.PATH_DRAW + 'bg_' + monster.elements.length + '.png');
    let hexType = parseInt((300 - monster.gifted) / 50);
    const hexagon = await Jimp.read(Constants.PATH_DRAW + 'hexagon_' + hexType + '.png');
    // let monsterPath = Constants.PATH_DRAW_LOCAL + monster.class + ".png";
    // if (monster.hue != 0) {
    //     monsterPath = Constants.PATH_DRAW_LOCAL + "hue_" + monster.class + ".png";
    // }
    // const imgMon = await Jimp.read(monsterPath);

    const tempLate = path;
    // const tempHexagon = Constants.PATH_DRAW + 'tempHexagon.png';

    // await imgMon.color([{ apply: "hue", params: [monster.hue] }])
    //     .resize(250, 250)
    //     .write(tempLate);

    await new Promise(resolve => setTimeout(resolve, 3000));

    let srcTemplate = await Jimp.read(Constants.PATH_ORIMONSTER + monster.class + "_" + monster.hue);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    // color function having hue modifier
    // hexagon.color([{ apply: "hue", params: [rd] }])
    //     .write(tempHexagon);

    await new Promise(resolve => setTimeout(resolve, 1000));
    // let srcHexagon = await Jimp.read(tempHexagon);

    image
        .print(font, 210, 5, monster.gHp) //HP
        .print(font, 20, 105, monster.gAtk) //ATK
        .print(font, 20, 310, monster.gDef) //DEF
        .print(font, 210, 410, monster.gMat) //MATK
        .print(font, 395, 310, monster.gMdf) //MDEF
        .print(font, 395, 105, monster.gAgi) //AGI
        // .color([{ apply: "hue", params: [rd] }])
        .composite(hexagon, 0, 0)
        .composite(srcTemplate, 100, 100)
        .write(path);
    // return cb();
}

function convertElementToInt(element) {
    var elementId = 0;
    switch (element.toLowerCase().trim()) {
        case "kim":
            elementId = 1;
            break;
        case "mộc":
            elementId = 2;
            break;
        case "thủy":
            elementId = 3;
            break;
        case "hỏa":
            elementId = 4;
            break;
        case "thổ":
            elementId = 5;
            break;
        case "băng":
            elementId = 6;
            break;
        case "lôi":
            elementId = 7;
            break;
        case "phong":
            elementId = 8;
            break;
        case "ám":
            elementId = 9;
            break;
        case "quang":
            elementId = 10;
            break;
        case "độc":
            elementId = 11;
            break;
    }
    return elementId;
}

async function convertElementtoString(element) {
    switch (element.toLowerCase().trim()) {
        case "1":
            element = "Metal";
            break;
        case "2":
            element = "Wood";
            break;
        case "3":
            element = "Water";
            break;
        case "4":
            element = "Fire";
            break;
        case "5":
            element = "Earth";
            break;
        case "6":
            element = "Ice";
            break;
        case "7":
            element = "Electric";
            break;
        case "8":
            element = "Wind";
            break;
        case "9":
            element = "Dark";
            break;
        case "10":
            element = "Light";
            break;
        case "11":
            element = "Poison";
            break;
    }
    return element;
}

async function getRealAttr(actor) {
    let monster = {};
    if (actor.tokenId) {
        monster.tokenId = actor.tokenId;
    }
    let paramsCl = actor.color * 20;

    monster.mhp = getRealHP(actor.mhp, actor.gHp, actor.trHp, actor.level, actor.color);
    monster.atk = getRelParams(actor.atk, actor.gAtk, actor.trAtk, actor.level, actor.color);
    monster.def = getRelParams(actor.def, actor.gDef, actor.trDef, actor.level, actor.color);
    monster.mat = getRelParams(actor.mat, actor.gMat, actor.trMat, actor.level, actor.color);
    monster.mdf = getRelParams(actor.mdf, actor.gMdf, actor.trMdf, actor.level, actor.color);
    monster.agi = getRelParams(actor.agi, actor.gAgi, actor.trAgi, actor.level, actor.color);
    monster.curHp = actor.curHp;

    monster.elements = actor.elements;
    monster.level = actor.level;

    return monster;
}

function getRelParams(base, Iv, EV, level, color) {

    return parseInt(((base + Iv) * level + EV) / 100 + level + 5 + color * 20);
}

function getRealHP(base, Iv, EV, level, color) {
    return parseInt(((base + Iv) * level + EV) / 100 + level + 10 + color * 20);
}

async function formulaDamage(skill, atker, defender) {
    let hitType = skill.hitType;
    let power = skill.pw;
    let levelPower = (2 * atker.level) / 5 + 2;
    let statPower = 0;
    //hitType De/Buff -> 0: Physic -> 1 ; Magic -> 2
    if (hitType == 1) {
        statPower = power * (atker.atk / defender.def);
    } else if (hitType == 2) {
        statPower = power * (atker.mat / defender.mdf);
    } else {

    }
    let k = (defender.agi / atker.agi) * 25;
    // return (levelPower * statPower) / 50 + 2;
    return ((levelPower * statPower) / 50) + 2;
}

async function formulaCrit() {
    const random = Math.floor(Math.random() * 250);
    if (random < 100) {
        return 1;
    }
    // Normal attack power
    return random / 100;
}

async function formulaEffect(atkElement, defElements) {
    let effect = 1;
    if (atkElement == -1) {
        return effect;
    }
    if (Constants[atkElement]) {
        for (let i = 0; i < defElements; i++) {
            let elementId = parseInt(defElements[i]);
            if (Constants[atkElement].immunes.includes(elementId)) {
                effect = 0;
                break;
            }
            if (Constants[atkElement].weaknesses.includes(elementId)) {
                if (effect != 0) {
                    effect = 0.25;
                }
            } else if (Constants[atkElement].strengths.includes(elementId)) {
                if (effect != 0.25 && effect != 0) {
                    effect = randomMinMax(2, 4);
                }
            }
        }
    }

    return effect;
}

async function getFightingResult(skill, attker, defender) {
    let crit = await formulaCrit();
    let damage = parseInt(await formulaDamage(skill, attker, defender) * await formulaEffect(skill.elementId, defender.elements) * crit);
    var miss = Math.random() >= skill.successRate * 0.01;
    var speed = attker.agi;
    if (miss) {
        damage = 0;
    }
    let resFighting = {
        damage: damage,
        miss: miss,
        speed: speed,
        crit: crit > 1,
    }
    return resFighting;
}

function expForLevel(level) {
    var basis = Constants.EXP_PARAMS[0];
    var extra = Constants.EXP_PARAMS[1];
    var acc_a = Constants.EXP_PARAMS[2];
    var acc_b = Constants.EXP_PARAMS[3];
    return Math.round(basis * (Math.pow(level - 1, 0.9 + acc_a / 250)) * level *
        (level + 1) / (6 + Math.pow(level, 2) / 50 / acc_b) + (level - 1) * extra);
};


function getLimitLose(party) {
    let limit = 0;
    for (let i = 0; i < party.length; i++) {
        if (party[i].curHp > 0) {
            limit++;
        }
    }
    return limit;
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}
module.exports = dbMoralis;