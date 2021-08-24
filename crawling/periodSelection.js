const submit = async (page) => {
    await page.click(
        "#content > div.section_instie_area.space_top > div > div.section.insite_inquiry > div > a"
    )
}

const periodSelection = async (page, periodSettings) => {
    const { selectCategory, period, periodTarget } = periodSettings
    try {
        if (await page.$("h1.error_title.sp_before")) {
            throw Error("일시적 트래픽 초과로 가져오지 못합니다.")
        }

        // 첫 카테고리 선정
        await page.click("span.select_btn")
        await page.click(`a[data-cid="${selectCategory[0]}"]`)

        // 2분류 설정
        await page.click(
            "#content > div.section_instie_area.space_top > div > div.section.insite_inquiry > div > div > div:nth-child(1) > div > div:nth-child(2) > span"
        )
        await page.click(`a[data-cid="${selectCategory[1]}"]`)

        if (selectCategory.length > 2) {
            // 3분류 설정
            await page.click(
                "#content > div.section_instie_area.space_top > div > div.section.insite_inquiry > div > div > div:nth-child(1) > div > div:nth-child(3) > span"
            )
            await page.click(``)
            await page.waitForTimeout(10)

            if (selectCategory.length > 3) {
                // 4분류 설정
                await page.click(
                    "#content > div.section_instie_area.space_top > div > div.section.insite_inquiry > div > div > div:nth-child(1) > div > div:nth-child(4) > span"
                )

                await page.click("")
            }
        }

        // 일간/주간/월간 설정
        await page.waitForTimeout(10)
        const periodButton = await page.$("div.set_period div.select.w4")
        await periodButton.click()

        await page.waitForSelector(
            `#content > div.section_instie_area.space_top > div > div.section.insite_inquiry > div > div > div:nth-child(2) > div.set_period > div > ul > li:nth-child(${period}) > a`
        )
        const periodValue = await page.$(
            `#content > div.section_instie_area.space_top > div > div.section.insite_inquiry > div > div > div:nth-child(2) > div.set_period > div > ul > li:nth-child(${period}) > a`
        )
        await page.evaluate((element) => {
            element.click()
        }, periodValue)

        // 1개월, 3개월, 1년 설정
        await page.click(`label[data-index='${periodTarget}']`)

        // 조회버튼
        await submit(page)
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    periodSelection,
}
