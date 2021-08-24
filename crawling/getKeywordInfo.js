const axios = require("axios")
const CryptoJS = require("crypto-js")
const dotenv = require("dotenv")
dotenv.config()

// relKeyword = outdata.relKeyword # 연관 키워드
// monthlyPcQcCnt = outdata.monthlyPcQcCnt # 30일간 PC 조회수
// monthlyMobileQcCnt = outdata.monthlyMobileQcCnt # 30일간 모바일 조회수
// monthlyAvePcClkCnt = outdata.monthlyAvePcClkCnt # 4주간 평균 PC 클릭수
// monthlyAveMobileClkCnt = outdata.monthlyAveMobileClkCnt # 4주간 평균 모바일 클릭수
// monthlyAvePcCtr = outdata.monthlyAvePcCtr # 4주간 평균 PC 클릭율
// monthlyAveMobileCtr = outdata.monthlyAveMobileCtr # 4주간 평균 모바일 클릭율
// plAvgDepth = outdata.plAvgDepth # 4주간 평균 PC 광고수
// compIdx = outdata.compIdx # PC 광고 기반 경쟁력

const { CUSTOMER_ID, ACCESS_LICENSE, SECRET_KEY } = process.env

const getKeywordInfo = async (keyword, option) => {
    const timestamp = Date.now() + ""
    const API_URL = "https://api.naver.com/keywordstool?hintKeywords"
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, SECRET_KEY)
    hmac.update(`${timestamp}.GET./keywordstool`)
    const hash = hmac.finalize()

    try {
        const options = {
            headers: {
                "X-Timestamp": timestamp.toString(),
                "X-API-KEY": ACCESS_LICENSE,
                "X-API-SECRET": SECRET_KEY,
                "X-Customer": CUSTOMER_ID.toString(),
                "X-Signature": hash.toString(CryptoJS.enc.Base64),
            },
        }

        const results = await axios
            .get(
                `${API_URL}=${encodeURIComponent(keyword)}&showDetail=1`,
                options
            )
            .then((res) => {
                return res.data.keywordList[0]
            })
            .catch((err) => {
                console.log(err)
            })
        return results
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    getKeywordInfo,
}
