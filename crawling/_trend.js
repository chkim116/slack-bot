const CATEGORY_LIST = [
    "패션의류",
    "패션잡화",
    "화장품/미용",
    "디지털/가전",
    "기구/인테리어",
    "출산/육아",
    "식품",
    "스포츠/레저",
    "생활/건강",
    "여가/생활편의",
    "면세점",
    "도서",
]

const CONSTANT_TYPE = {
    [CATEGORY_LIST[0]]: 50_000_000,
    [CATEGORY_LIST[1]]: 50_000_001,
    [CATEGORY_LIST[2]]: 50_000_002,
    [CATEGORY_LIST[3]]: 50_000_003,
    [CATEGORY_LIST[4]]: 50_000_004,
    [CATEGORY_LIST[5]]: 50_000_005,
    [CATEGORY_LIST[6]]: 50_000_006,
    [CATEGORY_LIST[7]]: 50_000_007,
    [CATEGORY_LIST[8]]: 50_000_008,
    [CATEGORY_LIST[9]]: 50_000_009,
    [CATEGORY_LIST[10]]: 50_000_010,
    [CATEGORY_LIST[11]]: 50_005_542,
}

// 일간=1 주간=2 월간=3
const periodValue = 2

// 기간 선택  1개월=0 3개월=1 1년=2 직접입력=3
const selectPeriod = 1

const constantSettings = {
    period: periodValue,
    periodTarget: selectPeriod,
    startRank: 1,
    rankLimit: 25,
}

const periodSettings = [
    {
        selectCategory: [CONSTANT_TYPE["기구/인테리어"], 50000108],
        ...constantSettings,
    },
]

module.exports = {
    periodSettings,
}
