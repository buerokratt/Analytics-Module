const baseUrl = process.env.REACT_APP_API_URL

export const getTesting = (): string => {
    return baseUrl + '/testing'
}

export const getAvgResponseTime = (): string => {
    return baseUrl + '/avg-response-time'
}

export const getAvgSessionLengthClientLeft = (): string => {
    return baseUrl + '/avg-session-length-client-left'
}

export const getAvgSessionLengthCsa = (): string => {
    return baseUrl + '/avg-session-length-csa'
}

export const getAvgSessionLengthNoCsa = (): string => {
    return baseUrl + '/avg-session-length-no-csa'
}

export const getPercentCurrectlyUnderstood = (): string => {
    return baseUrl + '/pct-currectly-understood'
}

