const { hours, minutes } = require("./utils/kTime")
const { RTMClient } = require("@slack/client")
require("dotenv").config()

const token = process.env.SLACK_TOKEN
const rtm = new RTMClient(token)

async function sendByWorking() {
    rtm.on("message", async (event) => {
        let text = event.text ? event.text : event.message.text
        const channel = event.channel
        if (text === "!출근") {
            return await rtm.sendMessage(
                `🏃 ${hours} ${minutes} 출근! 오늘도 화이팅🔥`,
                channel
            )
        }
        if (text === "!퇴근") {
            return await rtm.sendMessage(
                `🏃 ${hours} ${minutes} 퇴근! 오늘도 고생했삼🔥`,
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
