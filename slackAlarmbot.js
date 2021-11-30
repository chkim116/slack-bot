require("dotenv").config();
const { WebClient } = require("@slack/client");
const { WORK_TOKEN } = process.env;

const web = new WebClient(WORK_TOKEN);

async function postSlackMessage(channelName, text) {
    try {
        let channelId;

        const result = await web.conversations.list({
            token: WORK_TOKEN,
        });

        for (const channel of result.channels) {
            if (channel.name === channelName) {
                conversationId = channel.id;
                channelId = conversationId;
                break;
            }
        }

        if (channelId) {
            const res = await web.chat.postMessage({
                token: WORK_TOKEN,
                channel: channelId,
                text,
            });
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    postSlackMessage,
};
