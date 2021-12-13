const express = require("express");
const morgan = require("morgan");
const http = require("http");
const nodeSchedule = require("node-schedule");
const { workEnd, workStart } = require("./slackSlashbot");
const { postSlackMessage } = require("./slackAlarmbot");
const { scrapLaunch } = require("./scrap");
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
    const data = require("./lib/kw.json");
    res.status(200).send(data);
});
app.get("/scrap", async (req, res) => {
    try {
        await scrapLaunch();
        await postSlackMessage(
            "개발",
            `${new Date().toLocaleDateString()}자 황금 키워드 추출 완료 ${(
                (endTime - startTime) /
                1000
            ).toFixed()}초 소요. 황금키워드는 총 ${
                res.length
            }개, 전날 없던 키워드는 ${
                res.filter((lst) => lst.isNew).length
            }개 입니다.`
        );
        res.status(200);
    } catch (err) {
        console.error(err);
        await postSlackMessage("개발", "실패");
    }
});
app.get("/", (req, res) => res.send("이곳은 얼리21의 슬랙 앱입니다."));

app.listen(PORT, () =>
    console.log(
        process.env.NODE_ENV === "production"
            ? `Listening on ${PORT}`
            : `http://localhost:${PORT}`
    )
);

nodeSchedule.scheduleJob("0 15 22 * * *", function () {
    scrapLaunch();
});

setInterval(() => {
    http.get("http://early-slack.herokuapp.com/");
}, 1_800_000);
