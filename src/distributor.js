const ethers = require("ethers")
const axios = require("axios")

const { ENV, ADDRESS, ABI } = require("./config")
const { reportError } = require("./error")


async function distribute(signer, round) {
    const mcbMinter = new ethers.Contract(
        ADDRESS.MCB_MINTER,
        ABI.MCB_MINTER,
        signer
    );
    await mcbMinter.mintFromRound(round)
}

async function start() {
    // prepare calldata
    console.log(`going to call mcbMinter.mintFromRound(${Object.keys(tokens)}, ${Object.values(tokens)})`)
    const provider = new ethers.providers.JsonRpcProvider(ENV.ARBITRUM_RPC_ENDPOINT)
    const wallet = new ethers.Wallet(ENV.VALUE_CAPTURE_ADMIN_KEY, provider)
    await distribute(wallet, 0)
}

start().then().catch(reason => {
    return reportError("Forward")(reason.toString())
}).then(() => process.exit(1))

module.exports = {
    start
}