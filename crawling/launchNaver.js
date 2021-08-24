const puppeteer = require("puppeteer")
const { periodSelection } = require("./periodSelection")
const { crawlingBestKeywords } = require("./crawlingBestKeywords")

const DATA_LAB_URL = "https://datalab.naver.com/shoppingInsight/sCategory.naver"

const launchNaver = async (settings) => {
    const { rankLimit, startRank, ...periodSettings } = settings
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        await page.goto(DATA_LAB_URL, { waitUntil: "load", timeout: 0 })

        let res
        await periodSelection(page, periodSettings)
            .then(async () => {
                res = await crawlingBestKeywords(page, {
                    rankLimit,
                    startRank,
                })
            })
            .catch((err) => console.log(err))

        return res
    } catch (err) {
        console.log(err)
    } finally {
        await browser.close()
    }
}

module.exports = {
    launchNaver,
}
