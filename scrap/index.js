const fs = require("fs");
const puppeteer = require("puppeteer");
const { postSlackMessage } = require("../slackAlarmbot");

// firstCate : string,
// secondCate ?: string,
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
//     date: string,
//     res: [],
// };

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// 전날 없던 키워드 클릭
const newKwList = async (page) => {
    await page.click(
        "#content > div > div.table-top.d-none.d-lg-block.has-line > div > div > div > button.btn.btn-sm.btn-outline-default.filtered"
    );
    await sleep(50);

    await page.click("#chk");

    await page.click(
        "#modal-search-filter > div > div > div.modal-footer.p-0 > button"
    );
};

const extractFirstCateNm = async (page) => {
    const firstCate = await page.evaluate(() => {
        const firstCrumb = document.querySelector(
            "#content > div > div.location-area.has-line > nav > ol > li:nth-child(1)"
        )?.textContent;

        return firstCrumb || "";
    });

    return firstCate || null;
};

const extractSecondCateNm = async (page) => {
    const secondCate = await page.evaluate(() => {
        const secondCrumb = document.querySelector(
            "#content > div > div.location-area.has-line > nav > ol > li:nth-child(2)"
        )?.textContent;

        return secondCrumb;
    });

    return secondCate || null;
};

// 키워드 테이블 추출
const extractKwTable = async (page) => {
    const extractTable = await page.evaluate(() => {
        const firstCate = document.querySelector(
            "#content > div > div.location-area.has-line > nav > ol > li:nth-child(1)"
        )?.textContent;
        const secondCate = document.querySelector(
            "#content > div > div.location-area.has-line > nav > ol > li:nth-child(2)"
        )?.textContent;

        const keywordTable = document.querySelectorAll(
            "#datatable > tbody > tr"
        );
        let table = [];
        for (const tr of keywordTable) {
            const extract = tr.innerText.split("\t");
            const obj = {
                firstCate,
                secondCate,
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

    return extractTable;
};

const scrapLaunch = async () => {
    const TARGET_URL = "https://pandarank.net/search";
    let res = [];

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

    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await pageWithoutAssets(page);

    try {
        const startTime = new Date().getTime();
        console.time("크롤 시간 측정");
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

        // 황금 키워드 클릭
        await page.click(
            "#content > div > div.table-top.d-none.d-lg-block.has-line > div > div > div > button.btn.btn-sm.btn-outline-default.change-gold"
        );
        console.log("황금 키워드 클릭");

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
            // 1차 카테고리 선택 후 크롤
            await page.click(`#select1 > div > div > div:nth-child(${i}) > a`);
            await sleep(1000);

            const firstCate = await extractFirstCateNm(page);
            const keywords = await extractKwTable(page);
            console.log(`${firstCate} - ${keywords.length}개 추출 완료`);
            await sleep(100);

            await newKwList(page);
            await sleep(1000);
            const newKeywords = await extractKwTable(page);
            await sleep(100);
            console.log(
                `황금키워드 ${keywords.length}개 중 ${newKeywords.length}개는 전날 없었습니다.`
            );

            res = [
                ...res,
                ...keywords.map((lst) => {
                    if (newKeywords.find((kw) => kw.keyword === lst.keyword)) {
                        return { ...lst, isNew: true };
                    } else {
                        return { ...lst, isNew: false };
                    }
                }),
            ];

            // 누른 필터 삭제
            await newKwList(page);

            // 2차 카테고리 선택 후 크롤
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

                const secondCate = await extractSecondCateNm(page);
                const keywords = await extractKwTable(page);
                console.log(
                    `${firstCate} > ${secondCate} - ${keywords.length}개 추출 완료`
                );

                // 필터 다시 누름
                await newKwList(page);
                await sleep(1000);
                const newKeywords = await extractKwTable(page);
                await sleep(100);

                console.log(
                    `황금키워드 ${keywords.length}개 중 ${newKeywords.length}개는 전날 없었습니다.`
                );

                res = [
                    ...res,
                    ...keywords.map((lst) => {
                        if (
                            newKeywords.find((kw) => kw.keyword === lst.keyword)
                        ) {
                            return { ...lst, isNew: true };
                        } else {
                            return { ...lst, isNew: false };
                        }
                    }),
                ];

                // 눌려있던 필터 삭제
                await newKwList(page);
            }
        }
        console.timeEnd("크롤 시간 측정");
        const endTime = new Date().getTime();

        fs.writeFile(
            "./lib/kw.json",
            JSON.stringify({
                date: new Date().toLocaleDateString(),
                res,
            }),
            function (err) {
                if (err) {
                    console.log("에러발생");
                    throw new Error("올바르게 파일을 생성하지 못했습니다.");
                }
            }
        );
        postSlackMessage(
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
    } catch (err) {
        console.log(err);
        postSlackMessage(
            "개발",
            `${new Date().toLocaleDateString()}자 황금 키워드 추출 실패 `
        );
    } finally {
        await browser.close();
    }
};

module.exports = {
    scrapLaunch,
};

scrapLaunch();
