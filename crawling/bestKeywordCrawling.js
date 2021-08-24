const puppeteer = require("puppeteer")
const fs = require("fs")
const { getKeywordInfo } = require("./getKeywordInfo")
const { launchNaver } = require("./launchNaver")
const pageWithoutAssets = async (page) => {
    await page.setRequestInterception(true)

    page.on("request", (req) => {
        switch (req.resourceType()) {
            case "stylesheet":
            case "font":
            case "image":
                req.abort()
                break
            default:
                req.continue()
                break
        }
    })
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms))

const getStoreListByKeyword = async (page, kw) => {
    await page.goto(
        `https://search.shopping.naver.com/search/all?query=${encodeURI(kw)}`,
        { waitUntil: "networkidle2" }
    )
    try {
        await page.waitForSelector("body")
        const storeList = await page.evaluate(() => {
            const list = document.querySelector(
                "#__next > div > div.style_container__1YjHN > div.style_inner__18zZX > div.style_content_wrap__1PzEo > div.style_content__2T20F > div.seller_filter_area > ul > li.active > a > span.subFilter_num__2x0jq"
            ).textContent

            return list
        })

        return storeList
    } catch (err) {
        console.log(err)
    }
}

const bestKeywordCrawling = async (periodSettings) => {
    console.log("크롤링이 시작됩니다.")
    console.time("크롤링 시간 측정")
    const bestRank500 = await launchNaver(periodSettings).catch((err) =>
        console.log(err)
    )

    let keywords = []
    let relKeywords = []

    const extractText = async () => {
        await timer(0)
        for (let i = 0; i < bestRank500.length; i++) {
            for (let j = 0; j < bestRank500[i].length; j++) {
                const keyword = bestRank500[i][j].text
                keywords.push(keyword)
            }
        }
    }

    const getKeywordData = async () => {
        for (let i = 0; i < keywords.length; i++) {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            await pageWithoutAssets(page)

            console.log(i)
            await timer(300)
            const relKeyword = await getKeywordInfo(keywords[i], {
                onlyOne: true,
            })

            await timer(3000)
            const storeList =
                (await getStoreListByKeyword(page, relKeyword.relKeyword)) ||
                "0"

            const obj = {
                rank: i + 1,
                kw: relKeyword,
                storeList,
            }

            relKeywords.push(obj)
            await browser.close()
        }
    }

    await extractText().then(async () => {
        console.time("검색어 분석")
        await getKeywordData().then(() => {
            fs.writeFile(
                "./lib/trend.json",
                JSON.stringify(relKeywords),
                function (err) {
                    if (err) {
                        console.log("에러발생")
                        console.dir(err)
                        return
                    }
                }
            )
            console.timeEnd("검색어 분석")
        })
    })
    console.timeEnd("크롤링 시간 측정")
}

module.exports = {
    bestKeywordCrawling,
}
