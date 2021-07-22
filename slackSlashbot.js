const { hours, minutes } = require("./utils/kTime")
const axios = require("axios")

async function workStart(req, res) {
    const { user_name } = req.body

    const startWork = `${hours}시 ${minutes}분 출근 하위^^ `

    if (!user_name) {
        return
    }
    try {
        await axios
            .post(response_url, {
                response_type: "in_channel",
                delete_original: "true",
                text: startWork,
            })
            .catch((err) => console.log(err))
    } catch (err) {
        console.log(err)
        return res.send({ text: err.response.message || err.message })
    }
}

async function workEnd(req, res) {
    const { user_name, response_url } = req.body
    const startWork = `${hours}시 ${minutes}분 퇴근 숙오^^`

    if (!user_name) {
        return
    }
    try {
        await axios
            .post(response_url, {
                response_type: "in_channel",
                delete_original: "true",
                text: startWork,
            })
            .catch((err) => console.log(err))
    } catch (err) {
        console.log(err)
        return res.send({ text: err.response.message || err.message })
    }
}

module.exports = {
    workStart,
    workEnd,
}
