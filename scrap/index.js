const fs = require("fs");
const puppeteer = require("puppeteer");

// keyword: string,
// // 경쟁률
// comp: string,
// // 쇼핑전환
// cvr: string,
// // 광고비
// bid: string,
// // 검색량
// searchCnt: string,
// // 상품량
// prodCnt: string,
// // 평균가격
// prodPrcAvg: string,

// type Result = {
//     categoryNm: string,
//     keywords: ExtractTable[],
// };

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const scrapLaunch = async () => {
    const TARGET_URL = "https://pandarank.net/search";
    const res = [];

    const pageWithoutAssets = async (page) => {
        await page.setRequestInterception(true);

        page.on("request", (req) => {
            switch (req.resourceType()) {
                case "stylesheet":
                case "font":
                    req.abort();
                    break;
                default:
                    req.continue();
                    break;
            }
        });
    };

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await pageWithoutAssets(page);
    try {
        console.log("시작합니다.");
        await page.setExtraHTTPHeaders({
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36",
            "upgrade-insecure-requests": "1",
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,en;q=0.8",
        });
        await page.goto(TARGET_URL, { waitUntil: "load", timeout: 0 });
        console.log("접속 완료.");

        let categoryOneLen = 0;
        let categoryTwoLen = 0;

        await page.waitForSelector("#select1 > div > div");

        // 숫자로 보기 클릭
        await page.click(
            "#content > div > div.table-top.d-none.d-lg-block.has-line > div > div > div > button.btn.btn-sm.btn-outline-default.change-num"
        );
        console.log("숫자로 보기 클릭");

        categoryOneLen = await page.evaluate(() => {
            const categoryOne = document.querySelector("#select1 > div > div");
            return categoryOne?.children.length || 0;
        });

        for (let i = 1; i <= categoryOneLen; i++) {
            // 1차 카테고리 선택
            await page.click(`#select1 > div > div > div:nth-child(${i}) > a`);

            await sleep(100);

            // 2차 카테고리 선택
            categoryTwoLen = await page.evaluate(() => {
                const categoryTwo = document.querySelector(
                    "#select2 > div > div"
                );
                return categoryTwo?.children.length || 0;
            });

            for (let j = 1; j <= categoryTwoLen; j++) {
                await page.click(
                    `#select2 > div > div > div:nth-child(${j}) > a`
                );

                await sleep(1000);

                // 카테고리 이름 출력
                let categoryNm = await page.evaluate(() => {
                    const firstCrumb = document.querySelector(
                        "#content > div > div.location-area.has-line > nav > ol > li:nth-child(1)"
                    )?.textContent;
                    const secondCrumb = document.querySelector(
                        "#content > div > div.location-area.has-line > nav > ol > li:nth-child(2)"
                    )?.textContent;

                    const breadCrumb =
                        firstCrumb && secondCrumb
                            ? `${firstCrumb} > ${secondCrumb}`
                            : "알수없음";

                    return breadCrumb;
                });

                const extractTable = await page.evaluate(() => {
                    const keywordTable = document.querySelectorAll(
                        "#datatable > tbody > tr"
                    );

                    let table = [];
                    for (const tr of keywordTable) {
                        const extract = tr.innerText.split("\t");
                        const obj = {
                            categoryNm: categoryNm.split(">")[1],
                            keyword: extract[0],
                            comp: extract[1],
                            cvr: extract[2],
                            bid: extract[3],
                            searchCnt: extract[4],
                            prodCnt: extract[5],
                            prodPrcAvg: extract[6],
                        };
                        table.push(obj);
                    }
                    return table;
                });

                console.log(`${categoryNm} 추출 완료`);

                res.push({
                    categoryNm: categoryNm.split(">")[0],
                    keywords: extractTable,
                });
            }
        }
    } catch (err) {
        console.log(err);
    } finally {
        fs.writeFile("./lib/kw.json", JSON.stringify(res), function (err) {
            if (err) {
                console.log("에러발생");
                return;
            }
        });
        await browser.close();
    }
};

module.exports = {
    scrapLaunch,
};
