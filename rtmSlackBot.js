const { hours, minutes } = require("./utils/kTime")
const { RTMClient } = require("@slack/client")
require("dotenv").config()

const token = process.env.SLACK_TOKEN
const rtm = new RTMClient(token)

async function sendByWorking() {
    rtm.on("message", async (event) => {
        let text = event.text ? event.text : event.message.text
        const channel = event.channel
        if (text === "!μΆκ·Ό") {
            return await rtm.sendMessage(
                `π ${hours} ${minutes} μΆκ·Ό! μ€λλ νμ΄νπ₯`,
                channel
            )
        }
        if (text === "!ν΄κ·Ό") {
            return await rtm.sendMessage(
                `π ${hours} ${minutes} ν΄κ·Ό! μ€λλ κ³ μνμΌπ₯`,
                channel
            )
        }
        return ""
    })
    await rtm.start()
}

module.exports = {
    sendByWorking,
}
