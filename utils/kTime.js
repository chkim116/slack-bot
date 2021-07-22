const getKtime = () => {
    const timestamp =
        Date.now() + new Date().getTimezoneOffset() * 60000 + 9 * 3600 * 1000
    return new Date(timestamp)
}

function getTime() {
    const date = getKtime()
    const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
    const minutes =
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()

    return { hours, minutes }
}

module.exports = {
    getTime,
}
