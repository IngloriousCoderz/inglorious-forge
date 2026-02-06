export const ROWS_TO_GENERATE = 1000
export const ROWS_TO_UPDATE = 10
export const UPDATE_FREQUENCY = 10

export const MAX_VALUE = 1000
export const MAX_PROGRESS = 100

const Status = ["Active", "Pending", "Inactive"]

export const generateData = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `row_${i}`,
    rowId: i,
    name: `Item ${i}`,
    value: Math.floor(Math.random() * MAX_VALUE),
    status: Status[Math.floor(Math.random() * Status.length)],
    timestamp: Date.now(),
    progress: Math.floor(Math.random() * MAX_PROGRESS),
  }))
}

export const updateData = (data, count) => {
  const newData = [...data]
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * newData.length)
    newData[randomIndex] = {
      ...newData[randomIndex],
      value: Math.floor(Math.random() * MAX_VALUE),
      progress: Math.floor(Math.random() * MAX_PROGRESS),
      timestamp: Date.now(),
    }
  }
  return newData
}
