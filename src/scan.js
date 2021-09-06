const ethers = require("ethers")
const axios = require("axios")

const { ENV, ADDRESS } = require("./config")
const { save, load } = require("./stamp")
const { reportError } = require("./error")

const TRANSFER_EVENT_ID = ethers.utils.id("Transfer(address,address,uint256)")
const SCAN_STEP = 50_000

async function scanFroNewReceivedERC20(provider, recipient, startBlock, endBlock) {
    const filter = {
        topics: [
            [TRANSFER_EVENT_ID],
            [],
            [ethers.utils.hexlify(ethers.utils.zeroPad(recipient, 32))]
        ],
        fromBlock: startBlock,
        toBlock: endBlock,
    };
    const transferringEvents = await provider.getLogs(filter);
    return transferringEvents.map(v => v.address)
}

async function notify(endBlock, tokens) {
    var entries = []
    for (var i in tokens) {
        entries.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": "*ERC20*"
                },
                {
                    "type": "mrkdwn",
                    "text": `<https://arbiscan.io/address/${tokens[i]}|${tokens[i]}>`
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
                    "text": `#01 ERC20扫描结果 @${endBlock}`,
                    "emoji": true
                }
            },
            ...entries
        ]
    })
    await axios.post(
        ENV.SLACK_BOT_API,
        msg,
        { headers: { 'Content-Type': 'application/json', } }
    )
}

async function start() {
    // load
    const stamp = load("./stamps/scan_output.json", { lastBlockNumber: 0, tokens: [] })
    // get latest block number
    const provider = new ethers.providers.JsonRpcProvider(ENV.ARBITRUM_RPC_ENDPOINT)
    endBlock = await provider.getBlockNumber()
    if (stamp.lastBlockNumber == endBlock) {
        return
    }
    console.log(`going to scan tokens from ${stamp.lastBlockNumber} - ${endBlock}`)

    var tokens = stamp.tokens
    var begin = stamp.lastBlockNumber + 1
    var end = Math.min(begin + SCAN_STEP, endBlock)
    while (begin <= end) {
        console.log(`scanning transfer events from between ${begin} - ${end}`)
        const result = await scanFroNewReceivedERC20(
            provider,
            ADDRESS.VALUE_CAPTURE,
            begin,
            end
        )
        tokens = tokens.concat(result)
        save("./stamps/scan_output.json", { lastBlockNumber: end, tokens: Array.from(new Set(tokens)) })

        begin = end + 1
        end = Math.min(begin + SCAN_STEP, endBlock)
    }
    await notify(endBlock, Array.from(new Set(tokens)))
}

module.exports = {
    start
}

// start().then().catch(reason => {
//     return reportError("Scan")(reason.toString())
// }).then(() => process.exit(1))