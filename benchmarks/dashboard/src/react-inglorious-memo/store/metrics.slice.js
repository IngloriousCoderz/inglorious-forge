const withPayload = (type) => (payload) => ({ type, payload })

export const setFPS = withPayload("setFPS")
export const setFilter = withPayload("setFilter")
export const setSort = withPayload("setSort")
