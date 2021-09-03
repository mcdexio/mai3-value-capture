const axios = require("axios")

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
            "https://hooks.slack.com/services/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",
            msg,
            { headers: { 'Content-Type': 'application/json', } }
        )
    }
}

module.exports = {
    reportError
}