const baseUrl = process.env.REACT_APP_API_URL

export const getTesting = (): string => {
    return baseUrl + '/testing'
}

export const geBykAvgResponseTime = (): string => {
    return baseUrl + '/byk-avg-response-speed'
}

export const getBykAvgSessionTime = (): string => {
    return baseUrl + '/byk-avg-sessions-time'
}

export const getPercentCurrectlyUnderstoodByByk = (): string => {
    return baseUrl + '/byk-pct-correctly-understood'
}
