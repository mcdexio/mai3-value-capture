const ethers = require("ethers")
const axios = require("axios")

const { ENV, ADDRESS, ABI } = require("./config")
const { save, load } = require("./stampRedis")
const { reportError } = require("./error")


const ZERO_BYTES_32 = "0x0000000000000000000000000000000000000000000000000000000000000000"

async function filterBalances(provider, tokens, flags) {
    const batchReader = new ethers.Contract(
        ADDRESS.BATCH_READER,
        ABI.BATCH_READER,
        provider
    );
    const encoder = new ethers.utils.Interface(ABI.ERC20);
    const calldatas = new Array(tokens.length)
        .fill(encoder.encodeFunctionData(
            "balanceOf",
            [ADDRESS.VALUE_CAPTURE]
        ))
    balances = await batchReader.staticcall(tokens, calldatas)
    flags = tokens.map((_, i) => balances[i] != ZERO_BYTES_32)
    return { flags, balances }
}

async function filterForwardable(provider, tokens, flags) {
    const batchReader = new ethers.Contract(
        ADDRESS.BATCH_READER,
        ABI.BATCH_READER,
        provider
    );
    const valueCapture = new ethers.Contract(
        ADDRESS.VALUE_CAPTURE,
        ABI.VALUE_CAPTURE,
        provider
    );
    const isWhitelisted = new Set(await valueCapture.listUSDTokens(0, 1024))
    // exchange
    const unlisted = tokens.filter((_, i) => flags[i] && !isWhitelisted[tokens[i]])
    const encoder = new ethers.utils.Interface(ABI.VALUE_CAPTURE);
    const calldatas = unlisted.map(v => encoder.encodeFunctionData("externalExchanges", [v]))
    const result = await batchReader.staticcall(
        new Array(calldatas.length).fill(ADDRESS.VALUE_CAPTURE),
        calldatas
    )
    const isExchangeable = new Set(
        unlisted.filter((_, i) => result[i] != ZERO_BYTES_32)
    )
    flags = tokens.map((_, i) => flags[i] && (isWhitelisted.has(tokens[i]) || isExchangeable.has(tokens[i])))
    return { flags }
}

async function notify(endBlock, tokens) {

    console.log(tokens)

    var entries = []
    for (var key in tokens) {
        entries.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `<https://arbiscan.io/address/${key}|${key}>`
                },
                {
                    "type": "mrkdwn",
                    "text": `${ethers.BigNumber.from(tokens[key]).toString()}`
                }
            ]
        })
    }
    const msg = JSON.stringify({
        blocks: [
            {
                type: "header",
                text: {
                    "type": "plain_text",
                    "text": `#02 ERC20 Validate Result @${endBlock} `,
                    "emoji": true
                }
            },
            ...entries
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
    const stamp = await load("./stamps/scan_output.json")
    if (stamp.tokens.length == 0) {
        return;
    }
    const lastBlockNumber = stamp.lastBlockNumber

    const tokens = stamp.tokens;
    console.log(`going to check balance: ${tokens} `)
    // check balance
    const provider = new ethers.providers.JsonRpcProvider(ENV.ARBITRUM_RPC_ENDPOINT)
    var flags = []
    var { balances, flags } = await filterBalances(provider, tokens, flags)

    // check usd whitelist / exchange
    var { flags } = await filterForwardable(provider, tokens, flags)

    const tokensToFroward = {}
    tokens
        .map((_, i) => [tokens[i], balances[i]])
        .filter((_, i) => flags[i])
        .forEach(item => {
            tokensToFroward[item[0]] = item[1]
        })
    console.log(`tokens with non - zero balance: ${JSON.stringify(tokensToFroward)} `)
    await save("./stamps/validate_output.json", { tokens: tokensToFroward })

    await notify(lastBlockNumber, tokensToFroward)
}

// start().then().catch(reason => {
//     return reportError("Scan")(reason.toString())
// }).then(() => process.exit(1))

module.exports = {
    start
}