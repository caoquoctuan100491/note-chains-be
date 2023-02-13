//Version: 0.1.2 - Added MyID call to pass client username
//Version: 0.1.1 - Cleanup of profanity filter.
var auth = require('../auth.js');
var Constants = require('./../Utils/Constants');
const dbMoralis = require('../Entities/dbMoralis');
const moralis = new dbMoralis;
let loggedInUsers = {};
module.exports = function (sio) {
    var io = sio.of('/battle');
    io.use(auth.authSocket);

    io.on('connection', function (socket) {
        //Decoded Token
        let token = socket.user.data;
        const wallet = token.solAddress;
        let id = socket.id;
        // console.log(token);
        var username = token.username;
        loggedInUsers[username] = socket.id;

        // socket.emit('MyID', { name: username, id: id, userId: userId });
        //
        socket.on('Fighting', async function (data) {
            let parties = await moralis.getOrimons(wallet);
            let isFighted = false;
            if (parties.party1.length > 0) {
                let monster = parties.party1[0];
                if (monster.curHp > 0) {
                    let evsa = await moralis.getOne_EVSA(wallet);
                    let res = {};
                    if (evsa.get('type') >= 2) {
                        console.log('fighting');
                        let opponentWallet = evsa.get('opponentWallet');
                        let opponentId = opponentWallet.substring(0, 5) + "..." + opponentWallet.substring(opponentWallet.length - 5);
                        let opponentParties = await moralis.getOrimons(opponentWallet);
                        if (opponentParties.party1.length > 0) {
                            let opponentEvsa = await moralis.getOne_EVSA(opponentWallet);
                            opponentEvsa.set('eSkill', data.skill);
                            opponentEvsa.save(null, { useMasterKey: true });
                            const checkTimeOut = setTimeout(() => {
                                console.log(isFighted);
                                io.to(id).emit('resFighting', [{}, {}, { status: Constants.VICTORY }]);
                                io.to(loggedInUsers[opponentId]).emit('resFighting', [{}, {}, { status: Constants.DEFEAT }]);
                                resetEVSA(wallet);
                                resetEVSA(opponentWallet);
                            }, 60000);
                            socket.on('clearCheckTimeOut', () => {
                                console.log('clearCheckTimeOut');
                                clearTimeout(checkTimeOut);
                            })
                            if (evsa.get('player2') == wallet) {
                                let opponentMonster = opponentParties.party1[0];
                                if (evsa.get('eSkill') == 0) {
                                    let subscription = await moralis.getSubscribe_EVSA(wallet);
                                    subscription.on('update', async (obj) => {
                                        if (obj.get('eSkill') != 0) {
                                            // clearTimeout(checkTimeOut);
                                            subscription.unsubscribe();
                                            let opponentSkill = obj.get('eSkill');
                                            res = await moralis.fightingPVP(monster, opponentMonster, data.skill, opponentSkill, evsa, opponentEvsa);
                                            io.to(id).emit('resFighting', res[0]);
                                            io.to(loggedInUsers[opponentId]).emit('resFighting', res[1]);
                                            if (res[0].btResult1.status == Constants.VICTORY || res[1].btResult1.status == Constants.VICTORY) {
                                                resetEVSA(wallet);
                                                resetEVSA(opponentWallet);
                                            }
                                        }
                                    });
                                } else {
                                    // clearTimeout(checkTimeOut);
                                    let opponentSkill = evsa.get('eSkill');
                                    res = await moralis.fightingPVP(monster, opponentMonster, data.skill, opponentSkill, evsa, opponentEvsa);
                                    io.to(id).emit('resFighting', res[0]);
                                    io.to(loggedInUsers[opponentId]).emit('resFighting', res[1]);
                                    console.log(res);
                                    if (res[0].btResult.status == Constants.VICTORY || res[1].btResult.status == Constants.VICTORY) {
                                        resetEVSA(wallet);
                                        resetEVSA(opponentWallet);
                                    }
                                }
                            }
                        }
                    } else {
                        console.log('pve');
                        res = await moralis.fighting(wallet, monster, data.skill, data.type, data.signature);
                        io.to(id).emit('resFighting', res);
                    }
                }
            }
        });

        socket.on('getNewMonster', async function () {
            await moralis.getNewEnemy(wallet);
            // io.to(id).emit('resNewMonster', enemy);
        })

        //PVE



        //PVP

        socket.on('escape', async function () {
            escape();
        });

        socket.on('disconnect', async function (socket) {
            escape();
        });

        socket.on('changeActor', async function () {
            await moralis.changeActorPVP(wallet);
        });

        async function escape() {
            let evsa = await moralis.getOne_EVSA(wallet);
            await moralis.escapse(wallet);
            if (evsa) {
                let opponentWallet = evsa.get('opponentWallet');
                if (opponentWallet) {
                    let opponentId = opponentWallet.substring(0, 5) + "..." + opponentWallet.substring(opponentWallet.length - 5);
                    // io.to(id).emit('resFighting', [{}, {}, { status: Constants.DEFEAT }]);
                    if (evsa.get('type') >= 2) {
                        let btResult = { status: Constants.VICTORY };
                        switch (evsa.get('type')) {
                            case 3:

                                break;
                            case 4:
                                let myCurArena = await moralis.getOne_ARENA(wallet);
                                let myDataUpdate = {
                                    wallet: wallet,
                                    points: myCurArena.get('points') - 10,
                                    lose: myCurArena.get('lose') + 1,
                                    status: 'none'
                                }
                                await moralis.update_ARENA(myDataUpdate);

                                let curArena = await moralis.getOne_ARENA(opponentWallet);
                                let dataUpdate = {
                                    wallet: opponentWallet,
                                    points: curArena.get('points') + 10,
                                    win: curArena.get('win') + 1,
                                    status: 'none'
                                }
                                await moralis.update_ARENA(dataUpdate);
                                btResult.rewards = { points: 10 };
                                break;
                        }
                        io.to(loggedInUsers[opponentId]).emit('resFighting', [{}, {}, btResult]);
                    }
                    resetEVSA(opponentWallet);
                }
                resetEVSA(wallet);
            }
        }
        async function resetEVSA(wallet) {
            let dataUpdate = {
                wallet: wallet,
                enemy: '',
                win: 0,
                lose: 0,
                limitWin: 0,
                limitLose: 0,
                type: 0,
                eSkill: 0,
                opponentWallet: null,
                player2: null,
            }
            await moralis.updateBattle(dataUpdate);
        }
    });

};
