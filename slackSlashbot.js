const { hours, minutes } = require("./utils/kTime")

function workStart(req, res) {
    const { user_name } = req.body

    const startWork = `${hours}시 ${minutes}분 출근 하위^^ `

    if (!user_name) {
        return
    }
    return res.send({
        //  response_type: "in_channel" 메세지 추가
        replace_original: "true", // 메세지 업데이트
        text: startWork,
    })
}

function workEnd(req, res) {
    const { user_name } = req.body

    const startWork = `${hours}시 ${minutes}분 퇴근 숙오^^`

    if (!user_name) {
        return
    }
    return res.send({
        replace_original: "true", // 메세지 업데이트
        text: startWork,
    })
}

module.exports = {
    workStart,
    workEnd,
}
