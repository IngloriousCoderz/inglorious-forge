export const setFPS = withPayload("setFPS")
export const setFilter = withPayload("setFilter")
export const setSort = withPayload("setSort")

function withPayload(type) {
  return (payload) => ({ type, payload })
}
