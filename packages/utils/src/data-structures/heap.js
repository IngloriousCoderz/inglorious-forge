/**
 * Default comparator for a max-heap.
 * @param {*} a - First element.
 * @param {*} b - Second element.
 * @returns {number} Positive if `a` should come before `b`, negative otherwise.
 */
const DEFAULT_COMPARATOR = (a, b) => b - a

const ROOT_INDEX = 0
const SINGLE_ELEMENT = 1
const LEFT_CHILD_MULTIPLIER = 2
const RIGHT_CHILD_MULTIPLIER = 2
const PARENT_DIVISOR = 2
const LEFT_CHILD_OFFSET = 1
const RIGHT_CHILD_OFFSET = 2
const LAST_ELEMENT_OFFSET = 1
const INDEX_ADJUSTMENT = 1
const COMPARATOR_THRESHOLD = 0

/**
 * Checks if a heap contains a specific item.
 * @param {Array} heap - The heap array.
 * @param {*} item - The item to check for.
 * @returns {boolean} True if the item exists in the heap, false otherwise.
 */
export function contains(heap, item) {
  return heap.includes(item)
}

/**
 * Converts an array into a heap.
 * @param {Array} arr - The input array.
 * @param {Function} [comparator=DEFAULT_COMPARATOR] - Comparator function to define heap order.
 * @returns {Array} The heapified array.
 */
export function heapify(arr, comparator = DEFAULT_COMPARATOR) {
  let heap = []
  for (const item of arr) {
    heap = push(heap, item, comparator)
  }
  return heap
}

/**
 * Adds an item to the heap and maintains the heap property.
 * @param {Array} heap - The heap array.
 * @param {*} item - The item to add.
 * @param {Function} [comparator=DEFAULT_COMPARATOR] - Comparator function to define heap order.
 * @returns {Array} The updated heap array.
 */
export function push(heap, item, comparator = DEFAULT_COMPARATOR) {
  const h = [...heap, item]

  if (h.length === SINGLE_ELEMENT) {
    return h
  }

  let index = h.length - LAST_ELEMENT_OFFSET
  let parentIndex = parent(index)

  while (
    index > ROOT_INDEX &&
    comparator(h[index], h[parentIndex]) > COMPARATOR_THRESHOLD
  ) {
    ;[h[index], h[parentIndex]] = [h[parentIndex], h[index]]

    index = parentIndex
    parentIndex = parent(index)
  }

  return h
}

/**
 * Calculates the index of the left child of a given node.
 * @param {number} index - The index of the parent node.
 * @returns {number} The index of the left child.
 */
export function left(index) {
  return LEFT_CHILD_MULTIPLIER * index + LEFT_CHILD_OFFSET
}

/**
 * Calculates the index of the parent of a given node.
 * @param {number} index - The index of the child node.
 * @returns {number} The index of the parent node.
 */
export function parent(index) {
  return Math.floor((index - INDEX_ADJUSTMENT) / PARENT_DIVISOR)
}

/**
 * Removes and returns the root element of the heap.
 * @param {Array} heap - The heap array.
 * @param {Function} [comparator=DEFAULT_COMPARATOR] - Comparator function to define heap order.
 * @returns {Array} The updated heap array after removing the root.
 */
export function pop(heap, comparator = DEFAULT_COMPARATOR) {
  const h = [...heap]
  ;[h[ROOT_INDEX], h[h.length - LAST_ELEMENT_OFFSET]] = [
    h[h.length - LAST_ELEMENT_OFFSET],
    h[ROOT_INDEX],
  ]

  h.pop()

  let index = ROOT_INDEX
  let leftIndex = left(index)
  let rightIndex = right(index)
  let newMinFound = false

  while (leftIndex < h.length && !newMinFound) {
    const minIndex =
      rightIndex < h.length &&
      comparator(h[rightIndex], h[leftIndex]) > COMPARATOR_THRESHOLD
        ? rightIndex
        : leftIndex
    newMinFound = comparator(h[minIndex], h[index]) > COMPARATOR_THRESHOLD

    if (newMinFound) {
      ;[h[minIndex], h[index]] = [h[index], h[minIndex]]

      index = minIndex
      leftIndex = left(index)
      rightIndex = right(index)
    }
  }

  return h
}

/**
 * Removes the root element and reorders the heap.
 * @param {Array} heap - The heap array.
 * @returns {Array} The updated heap array.
 */
export function remove(heap) {
  const [, ...rest] = heap
  return heapify([
    ...rest.slice(-LAST_ELEMENT_OFFSET),
    ...rest.slice(ROOT_INDEX, -LAST_ELEMENT_OFFSET),
  ])
}

/**
 * Calculates the index of the right child of a given node.
 * @param {number} index - The index of the parent node.
 * @returns {number} The index of the right child.
 */
export function right(index) {
  return RIGHT_CHILD_MULTIPLIER * index + RIGHT_CHILD_OFFSET
}

/**
 * Retrieves the root element of the heap.
 * @param {Array} heap - The heap array.
 * @returns {*} The root element of the heap.
 */
export function root(heap) {
  return heap[ROOT_INDEX]
}
