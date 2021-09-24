var redis = require('redis')

const { ENV } = require("./config")

const client = redis.createClient({ url: ENV.REDIS })
const Prefix = "captureutils:arb1:"

async function load(path, defaultValue) {
    if (!client.isOpen) {
        await client.connect()
    }
    try {
        let result = await client.get(_key(path)) || defaultValue
        return JSON.parse(result).value
    } catch (e) {
        if (typeof defaultValue != "undefined") {
            return defaultValue
        }
        throw e
    }
}

async function save(path, value) {
    const content = {
        value,
        timestamp: Date.parse(new Date()) / 1000,
    }
    console.log(content)
    await client.set(_key(path), JSON.stringify(content));
}

function _key(path) {
    return Prefix + path
}

module.exports = {
    load,
    save,
}