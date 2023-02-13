const Constants = require("./Utils/Constants");
const fs = require("fs");
const Jimp = require("jimp");

async function drawImage(monster) {//TODO need fix
    const image = await Jimp.read(Constants.PATH_DRAW + 'bg_' + monster.elements.length + '.png');
    let hexType = parseInt((300 - monster.gifted) / 50);
    const hexagon = await Jimp.read(Constants.PATH_DRAW + 'hexagon_' + hexType + '.png');
    let monsterPath = Constants.PATH_DRAW_LOCAL + monster.class + ".png";
    if (monster.hue != 0) {
        monsterPath = Constants.PATH_DRAW_LOCAL + "hue_" + monster.class + ".png";
    }
    const imgMon = await Jimp.read(monsterPath);

    const tempLate = path;
    // const tempHexagon = Constants.PATH_DRAW + 'tempHexagon.png';

    await imgMon.color([{ apply: "hue", params: [monster.hue] }])
        .resize(250, 250)
        .write(tempLate);

    await new Promise(resolve => setTimeout(resolve, 3000));

    let srcTemplate = await Jimp.read(tempLate);

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

async function drawArt(index, hue) {
    let tempLate = Constants.PATH_ORIMONSTER + index + "_" + hue * 10 + ".png";
    let monsterPath = Constants.PATH_DRAW_LOCAL + index + ".png";
    if (hue != 0) {
        monsterPath = Constants.PATH_DRAW_LOCAL + "hue_" + index + ".png";
    }
    const imgMon = await Jimp.read(monsterPath);
    await imgMon.color([{ apply: "hue", params: [hue * 10] }])
        .resize(250, 250)
        .write(tempLate);

    // const image = await Jimp.read(Constants.PATH_DRAW + 'bg_' + bg + '.png');
    // const hexagon = await Jimp.read(Constants.PATH_DRAW + 'hexagon_' + hex + '.png');
    // let srcTemplate = await Jimp.read(tempLate);

    // image
    //     // .color([{ apply: "hue", params: [hue] }])
    //     .composite(hexagon, 0, 0)
    //     .composite(srcTemplate, 100, 100)
    //     .write(tempLate);
}


async function createAll() {
    for (let index = 1; index <= 160; index++) {
        for (let hue = 0; hue <= 35; hue++) {
            // for (let bg = 1; bg <= 11; bg++) {
            //     for (let hex = 0; hex < 6; hex++) {
            //         await drawArt(index, hue, bg, hex);
            //     }
            // }
            await drawArt(index, hue);
        }
    }
}

createAll();