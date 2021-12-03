const { getTime } = require("./utils/kTime");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

async function workStart(req, res) {
    const { user_id: userId, response_url, user_name } = req.body;
    const { hours, minutes } = getTime();
    const startWork = `${hours}시 ${minutes}분 출근 하위^^ `;

    if (!userId) {
        return;
    }

    try {
        const {
            user: { real_name },
        } = await axios
            .get(`https://slack.com/api/users.info`, {
                headers: {
                    Authorization: `Bearer ${process.env.WORK_TOKEN}`,
                },
                params: { user: userId },
            })
            .then((res) => res.data)
            .catch((err) => console.log(err));

        await axios
            .post(response_url, {
                response_type: "in_channel",
                delete_original: "true",
                text: `${real_name || user_name} ${startWork}`,
            })
            .catch((err) => console.log(err));
        return res.send();
    } catch (err) {
        console.log(err);
        return res.send({ text: err.response.message || err.message });
    }
}

async function workEnd(req, res) {
    const { user_id: userId, response_url, user_name } = req.body;
    const { hours, minutes } = getTime();
    const startWork = `${hours}시 ${minutes}분 퇴근 숙오^^`;

    if (!userId) {
        return;
    }
    try {
        const {
            user: { real_name },
        } = await axios
            .get(`https://slack.com/api/users.info`, {
                headers: { Authorization: `Bearer ${process.env.WORK_TOKEN}` },
                params: { user: userId },
            })
            .then((res) => res.data)
            .catch((err) => console.log(err));

        await axios
            .post(response_url, {
                response_type: "in_channel",
                delete_original: "true",
                text: `${real_name || user_name} ${startWork}`,
            })
            .catch((err) => console.log(err));
        return res.send();
    } catch (err) {
        console.log(err);
        return res.send({ text: err.response.message || err.message });
    }
}

module.exports = {
    workStart,
    workEnd,
};
