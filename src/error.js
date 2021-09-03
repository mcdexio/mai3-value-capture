const axios = require("axios")

const { ENV } = require("./config")

function reportError(title) {
    return async function (error) {

        console.log(error)

        const msg = {
            blocks: [
                {
                    type: "header",
                    text: {
                        "type": "plain_text",
                        "text": `!!! 日常脚本执行错误: ${title}`,
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    text: {
                        "type": "plain_text",
                        "text": error
                    }
                }
            ]
        }
        await axios.post(
            ENV.SLACK_BOT_API,
            msg,
            { headers: { 'Content-Type': 'application/json', } }
        )
    }
}

module.exports = {
    reportError
}