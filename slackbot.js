const config = require("dotenv").config()
const { RTMClient } = require("@slack/client")
const token = process.env.SLACK_TOKEN
const rtm = new RTMClient(token)

const getKtime = () => {
    const timestamp =
        Date.now() + new Date().getTimezoneOffset() * 60000 + 9 * 3600 * 1000
    return new Date(timestamp)
}

async function sendByWorking() {
    rtm.on("message", async (event) => {
        let text = event.text ? event.text : event.message.text

        const channel = event.channel
        const date = getKtime()
        const hours =
            date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
        const minutes =
            date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()

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
