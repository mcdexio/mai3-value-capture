const fs = require("fs")

function load(path, defaultValue) {
    try {
        return JSON.parse(fs.readFileSync(path)).value
    } catch (e) {
        if (typeof defaultValue != "undefined") {
            return defaultValue
        }
        throw e
    }
}

function save(path, value) {
    const content = {
        value,
        timestamp: Date.parse(new Date()) / 1000,
    }
    fs.writeFileSync(path, JSON.stringify(content, null, "  "))
}

module.exports = {
    load,
    save,
}