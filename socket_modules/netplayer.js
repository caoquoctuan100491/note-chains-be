// Version: 0.1.0 - Cleanup of initial Version
let auth = require('../auth.js');
const dbMoralis = require('../Entities/dbMoralis');
const moralis = new dbMoralis;

const Solana = require('../Entities/solana');
const solana = new Solana();
let ConstSolana = require('./../Utils/ConstSolana');
let loggedInUsers = {};
module.exports = function (sio) {

    let io = sio.of('/netplayers');

    io.use(auth.authSocket);

    io.on('connection', async function (socket) {
        let token = socket.user.data;
        if (token) {
            const wallet = token.solAddress;
            let id = socket.id;
            let currentRoom = '0'; //Room names are based off Map ID

            let update = {
                wallet: wallet,
                isLoged: true,
                busy: false,
                socketId: id
            }
            // console.log(update);
            await moralis.update_UserDetail(update);
            var username = token.username;
            loggedInUsers[username] = socket.id;


            socket.emit('MyID', { id: id, userId: wallet, room: currentRoom, name: token.username, email: token.email });

            //Gather XY Position and broadcast to all other players
            socket.on('DestinationXY', async function (data) {
                // console.log(data);

                if (data.region != 0 && data.z) {
                    let meetMonster = await moralis.hunterMonster(wallet);
                    io.to(id).emit('findMonster', meetMonster);
                }
                socket.broadcast.to(currentRoom).emit('NetworkPlayersXY', data);
            });

            socket.on('changeRoom', async function (data) {
                socket.broadcast.to(currentRoom).emit('removePlayer', { id: id, room: currentRoom });
                socket.leave(currentRoom);
                currentRoom = data;
                socket.join(data);
                socket.emit('changeRoomlet', data);
            });

            socket.on('disconnect', async function (socket) {
                io.in(currentRoom).emit('removePlayer', { id: id, room: currentRoom });
                let update = {
                    wallet: token.wallet,
                    isLoged: false,
                    busy: false,
                    socketId: ""
                }
                await moralis.update_UserDetail(update);
            });
            socket.on('syncOnChain', async function () {
                moralis.syncNFTParties(wallet);
            });
            socket.on('healAll', async function (data) {
                // console.log(data.signature);
                let verify = await solana.checkSignature(data.signature, 'transfer', 1, wallet, ConstSolana.testnet.accountSoulStone);
                let res = {};
                console.log(verify);
                if (verify) {
                    res = await moralis.healAll(wallet, 100, true);
                }

                socket.emit('healAllDone', res);
            })

            socket.on('useItem', async function (data) {
                let monster = await moralis.getMonsterByTokenId(data.tokenId);
                await moralis.useItem(data.itemId, monster, null, data.signature, wallet);
                socket.emit('updateUseItem');
            });
            socket.on('reqSocketTo', async (data) => {
                switch (data.message) {
                    case 'acceptAddFriend':
                        await moralis.addFriends(data.from, data.to);
                        await moralis.addFriends(data.to, data.from);
                        break;
                    case 'acceptPVP':
                        let res = await moralis.setupPVP(2, data.from, data.to);
                        data.enemy = res[data.from];
                        io.to(socket.id).emit('reqSocketTo', data);
                        data.enemy = res[data.to];
                        break;
                    case 'acceptBetPVP':
                        break;
                }
                io.to(loggedInUsers[data.to]).emit('reqSocketTo', data);
            });

            //ARENA
            socket.on('findArenaBattler', async () => {
                let monsters = await moralis.getOrimonsBattle(wallet);
                if (monsters[0].curHp > 0) {
                    let status = 'find';
                    let myArena = await moralis.getOne_ARENA(wallet);
                    let arena = await moralis.Find_ARENA(status, myArena.get('points'));
                    if (arena) {
                        if (arena.get(wallet) != wallet) {
                            status = 'busy';
                            let update = {
                                wallet: arena.get('wallet'),
                                status: status,
                            };
                            await moralis.update_ARENA(update);
                            let username = wallet.substring(0, 5) + "..." + wallet.substring(wallet.length - 5);
                            opponentWallet = arena.get('wallet');
                            let opponentId = opponentWallet.substring(0, 5) + "..." + opponentWallet.substring(opponentWallet.length - 5);
                            await moralis.setupPVP(4, username, opponentId);

                            io.to(socket.id).emit('startArenaBattle');
                            io.to(loggedInUsers[opponentId]).emit('startArenaBattle');
                        }
                    }
                    let dataUpdate = {
                        wallet: wallet,
                        status: status
                    }
                    await moralis.update_ARENA(dataUpdate);
                }
            });

            socket.on('cancelFindArenaBattler', async () => {
                let update = {
                    wallet: wallet,
                    status: 'none',
                };
                await moralis.update_ARENA(update);
            });

            //Events

            socket.on('getUrlNFT',async(data)=>{
                let url = await moralis.getUrlNFT(data);
                io.to(socket.id).emit('resUrlNFT',url);
            });

            socket.on('isNFT',async (tokenId)=>{
                let dataupdate = {
                    tokenId:tokenId,
                    isNFT:true,
                }
                await moralis.update_Monster(dataupdate);
            })
        }
    });
};

