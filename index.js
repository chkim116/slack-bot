const express = require("express");
const morgan = require("morgan");
const http = require("http");
const cron = require("node-cron");
const { workEnd, workStart } = require("./slackSlashbot");
const { scrapLaunch } = require("./scrap");
const fs = require("fs");
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
    cors({
        origin:
            process.env.ORIGIN === "production"
                ? "https://early21.com"
                : "http://localhost:3000",
        credentials: true,
    })
);

app.post("/slack/work/start", workStart);
app.post("/slack/work/end", workEnd);
app.get("/kw", (req, res) => {
    const json = fs.readFileSync("./lib/kw.json", "utf-8");
    const data = JSON.parse(json);
    res.status(200).send(data);
});
app.get("/", (req, res) => res.send("이곳은 얼리21의 슬랙 앱입니다."));

app.listen(PORT, () =>
    console.log(
        process.env.NODE_ENV === "production"
            ? `Listening on ${PORT}`
            : `http://localhost:${PORT}`
    )
);

cron.schedule("0 30 22 * * *", function () {
    scrapLaunch();
});

setInterval(() => {
    http.get("http://early-slack.herokuapp.com/");
}, 1_800_000);
