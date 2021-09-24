const ethers = require("ethers")
const axios = require("axios")

const { ENV, ADDRESS, ABI } = require("./config")
const { save, load } = require("./stampRedis")
const { reportError } = require("./error")


async function fowardTokens(signer, tokens) {
    const valueCapture = new ethers.Contract(
        ADDRESS.VALUE_CAPTURE,
        ABI.VALUE_CAPTURE,
        signer
    );
    console.log(Object.keys(tokens), Object.values(tokens))
    await valueCapture.forwardMultiAssets(Object.keys(tokens), Object.values(tokens))
}

async function notify() {
    const msg = JSON.stringify({
        blocks: [
            {
                type: "header",
                text: {
                    "type": "plain_text",
                    "text": `#03 Forward Execution Done`,
                    "emoji": true
                }
            }
        ]
    })
    console.log("[DEBUG]:", JSON.stringify(msg))
    try {
        await axios.post(
            ENV.SLACK_BOT_API,
            msg,
            { headers: { 'Content-Type': 'application/json', } }
        )
    } catch (err) {
        if (typeof err.response != 'undefined') {
            console.log(err.response.data)
        } else {
            console.error(err);
        }
    }
}

async function start() {
    // prepare calldata
    const stamp = await load("./stamps/validate_output.json")
    const tokens = stamp.tokens;
    if (Object.keys(tokens) == 0) {
        console.log("nothing to forward")
        return;
    }

    console.log(`going to call valueCapture.forwardMultiAssets(${Object.keys(tokens)}, ${Object.values(tokens)})`)
    const provider = new ethers.providers.JsonRpcProvider(ENV.ARBITRUM_RPC_ENDPOINT)
    const wallet = new ethers.Wallet(ENV.VALUE_CAPTURE_ADMIN_KEY, provider)
    await fowardTokens(wallet, tokens)

    await notify();
}

// start().then().catch(reason => {
//     return reportError("Forward")(reason.toString())
// }).then(() => process.exit(1))

module.exports = {
    start
}