const withPayload = (type) => (payload) => ({ type, payload })
const withoutPayload = (type) => () => ({ type })

export const randomUpdate = withoutPayload("randomUpdate")
export const tableClick = withPayload("tableClick")
