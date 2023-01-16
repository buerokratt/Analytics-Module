const baseUrl = process.env.REACT_APP_API_URL

export const getTesting = (): string => {
    return baseUrl + '/testing'
}
