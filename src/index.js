
const scan = require("./scan")
const validate = require("./validate")
const forward = require("./forward")


async function main() {
    await scan.start()
    console.log("scanning done.")
    await validate.start()
    console.log("validate done.")
    await forward.start()
    console.log("forward done.")
}

main().then().catch(console.log).then(() => process.exit(0))
