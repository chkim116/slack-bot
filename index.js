const express = require("express")
const PORT = process.env.PORT || 5000

const app = express()

app.get("/", (req, res) => res.send("이곳은 얼리21의 슬랙 앱입니다."))
app.listen(PORT, () =>
    console.log(
        process.env.NODE_ENV === "production"
            ? `Listening on ${PORT}`
            : `http://localhost:${PORT}`
    )
)
