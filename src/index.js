
const scan = require("./scan")
const validate = require("./validate")
const forward = require("./forward")
const distribute = require("./distribute")


async function main() {
    await scan.start()
    console.log("scanning done.")
    await validate.start()
    console.log("validate done.")
    await forward.start()
    console.log("forward done.")
    // await distribute.start()
    // console.log("distribute done.")
}

main().then().catch(console.log).then(() => process.exit(0))
