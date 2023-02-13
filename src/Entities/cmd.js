function cmd() { };
const { exec } = require("child_process");
cmd.prototype.runLine = async function (line) {
    exec(line, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        return stdout;
    });
}


cmd.prototype.setNetwork = async function (type) {
    try {
        let RPC_Url = "";
        if (type == 'devnet') {
            RPC_Url = "https://api.devnet.solana.com";
        } else if (type == "mainnet") {
            RPC_Url = "https://api.mainnet-beta.solana.com";
        }
        let line = 'solana config set --url ' + RPC_Url;
        let res = await this.runLine(line);
        console.log(res);
    } catch (error) {
        
    }
   
}

cmd.prototype.mintNFT = async function () {
    let lineMintNFT = '';
    let res = await this.runLine(lineMintNFT);

}

cmd.prototype.createTokenNFT = async function () {
    line = 'spl-token create-token --decimals 0';
    return await this.runLine(line);
}

cmd.prototype.createAccount = async function (address) {
    line = 'spl-token create-account' + address;
    return await this.runLine(line);
}

cmd.prototype.transfer = async function (mintPublicKey, userPublicKey, amount) {
    let line = 'spl-token transfer --fund-recipient ' + mintPublicKey + ' ' + amount + ' ' + userPublicKey;
    return await this.runLine(line);
}

cmd.prototype.uploadByCandyMachine = async function () {
    let line = 'ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts upload -e devnet -k ~/.config/solana/devnet.json -cp cm_config.json -c cmTemp ./assets';
    // let line = 'yarn --version';
    return await this.runLine(line);
}

cmd.prototype.verifyUpload = async function () {
    let line = 'ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts verify_upload -e devnet -k ~/.config/solana/devnet.json -c cmTemp';
    return await this.runLine(line);
}

cmd.prototype.mintTokenByCandyMachine = async function (number) {
    let line = 'ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts mint_one_token -e devnet -k ~/.config/solana/devnet.json -c cmTemp';
    if (number > 1) {
        line = 'ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts mint_multiple_tokens -e devnet -k ~/.config/solana/devnet.json -c cmTemp --number ' + number;
    }
    return await this.runLine(line);
}

module.exports = cmd;