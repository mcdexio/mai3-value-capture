const { load, save } = require("../src/stampRedis")


async function run() {
    const stamp = await load("./stamps/scan_output.json", { lastBlockNumber: 0, tokens: [] })
    console.log(stamp)
    const end = stamp.lastBlockNumber + 100
    tokens = ["0", "1"]
    await save("./stamps/scan_output.json", { lastBlockNumber: end, tokens: Array.from(new Set(tokens)) })
}



run().then(() => { process.exit(0) }).catch(console.log)