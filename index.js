const express = require("express")
const morgan = require("morgan")
const http = require("http")
const { workEnd, workStart } = require("./slackSlashbot")

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

app.post("/slack/work/start", workStart)
app.post("/slack/work/end", workEnd)

app.get("/", (req, res) => res.send("이곳은 얼리21의 슬랙 앱입니다."))

app.listen(PORT, () =>
    console.log(
        process.env.NODE_ENV === "production"
            ? `Listening on ${PORT}`
            : `http://localhost:${PORT}`
    )
)

setInterval(() => {
    http.get("https://early-slack.herokuapp.com/")
}, 1800000)
