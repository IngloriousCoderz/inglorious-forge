export const TREE_DEPTH = 8
export const BRANCHING_FACTOR = 3
export const UPDATE_INTERVAL = 300
export const UPDATES_PER_TICK = 1

export const FPS_WINDOW = 10
export const FPS_BENCHMARK_SAMPLES = 30

const MIN_VALUE = 0
const MAX_VALUE = 1000

const randomValue = () =>
  Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE

export const createTreeModel = () => {
  const leafIds = []
  const counter = { totalNodes: 0, totalLeaves: 0 }

  const root = buildNode(0, [], leafIds, counter)

  return {
    root,
    leafIds,
    totalNodes: counter.totalNodes,
    totalLeaves: counter.totalLeaves,
  }
}

const buildNode = (depth, path, leafIds, counter) => {
  counter.totalNodes += 1

  const isLeaf = depth >= TREE_DEPTH
  const id = path.length ? `node_${path.join("_")}` : "node_root"

  if (isLeaf) {
    counter.totalLeaves += 1
    const leafId = path.length ? `leaf_${path.join("_")}` : "leaf_root"
    leafIds.push(leafId)

    return {
      id,
      depth,
      leafId,
      children: [],
    }
  }

  const children = Array.from({ length: BRANCHING_FACTOR }, (_, index) =>
    buildNode(depth + 1, [...path, index], leafIds, counter),
  )

  return {
    id,
    depth,
    children,
  }
}

export const createInitialLeafValues = (leafIds) => {
  return leafIds.reduce((acc, leafId) => {
    acc[leafId] = {
      value: randomValue(),
      version: 0,
    }
    return acc
  }, {})
}

export const pickRandomLeafId = (leafIds) => {
  const randomLeafIndex = Math.floor(Math.random() * leafIds.length)
  return leafIds[randomLeafIndex]
}

export const updateLeafValuesImmutable = (leafValues, leafIds) => {
  const leafId = pickRandomLeafId(leafIds)
  const current = leafValues[leafId]

  return {
    leafId,
    nextLeafValues: {
      ...leafValues,
      [leafId]: {
        value: randomValue(),
        version: current.version + 1,
      },
    },
  }
}

export const updateLeafValuesMutative = (leafValues, leafIds) => {
  const leafId = pickRandomLeafId(leafIds)
  const current = leafValues[leafId]
  leafValues[leafId] = {
    value: randomValue(),
    version: current.version + 1,
  }
  return leafId
}
