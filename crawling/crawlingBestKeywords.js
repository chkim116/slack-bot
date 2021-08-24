// Top500 크롤링

// 인기검색어 랭킹차트는 1-20위 총 25페이지 (500개)
const PER_RANK_LIST = 20
// const RANK_LIST_LIMIT = 1

let first = true

const getList = async (page, index) => {
    let rankList = {}
    try {
        await page.waitForSelector(
            `#content > div.section_instie_area.space_top > div > div:nth-child(2) > div.section_insite_sub > div > div > div.rank_top1000_scroll > ul > li:nth-child(${index})`
        )
        const text = await page.$eval(
            `#content > div.section_instie_area.space_top > div > div:nth-child(2) > div.section_insite_sub > div > div > div.rank_top1000_scroll > ul > li:nth-child(${index})`,
            (el) => el.innerText.split("\n")
        )
        rankList["rank"] = text[0]
        rankList["text"] = text[1]
    } catch (err) {
        console.log(err)
    }

    return Promise.resolve(rankList)
}

const getAllRankList = async (page, perRankListLimit, startPoint) => {
    let keywords = []
    let i = first ? startPoint - 1 : 0

    for (i = first ? startPoint - 1 : 0; i < perRankListLimit; i++) {
        await page.waitForTimeout(10)
        keywords.push(await getList(page, i + 1))
    }
    if (first) {
        first = false
    }

    return Promise.resolve(keywords)
}

const crawlingBestKeywords = async (page, { rankLimit, startRank }) => {
    let res = []
    try {
        const limit = Math.ceil(rankLimit / PER_RANK_LIST)
        const startPoint =
            startRank - PER_RANK_LIST * Math.floor(startRank / PER_RANK_LIST)

        for (let i = 0; i < limit; i++) {
            if (first) {
                for (let j = 0; j < Math.ceil(startRank / PER_RANK_LIST); j++) {
                    await page.$eval(
                        "#content > div.section_instie_area.space_top > div > div:nth-child(2) > div.section_insite_sub > div > div > div.top1000_btn_area > div > a.btn_page_next",
                        (el) => el.click()
                    )
                    await page.waitForTimeout(50)
                }
            }

            await res.push(
                await getAllRankList(
                    page,
                    i < limit - 1
                        ? PER_RANK_LIST
                        : Math.abs(i * PER_RANK_LIST - rankLimit),
                    first ? startPoint : 0
                )
            )

            await page.waitForTimeout(50)

            if (i < limit || i !== 0) {
                await page.$eval(
                    "#content > div.section_instie_area.space_top > div > div:nth-child(2) > div.section_insite_sub > div > div > div.top1000_btn_area > div > a.btn_page_next",
                    (el) => el.click()
                )
                await page.waitForTimeout(50)
            }
        }

        return res
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    crawlingBestKeywords,
}
