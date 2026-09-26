import { v } from "@inglorious/utils"
import { getIndex, neighbors } from "@inglorious/utils/data-structures/board"
import { random } from "@inglorious/utils/math/rng"

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  BOARD_X,
  BOARD_Z,
  CELL_SIZE,
  EMPTY,
  FOX,
  FOX_INITIAL_THRESHOLD,
  INITIAL_ANIMAL_THRESHOLD,
  ONE,
  RABBIT,
  SPECIES,
  TWO,
  ZERO,
} from "./constants.js"

let nextAnimalId = ZERO
const MAX_POPULATION = BOARD_ROWS * BOARD_COLUMNS

export function createGrid() {
  const entityAt = new Array(MAX_POPULATION).fill(EMPTY)
  let population = ZERO

  function indexOf(row, column) {
    return getIndex(row, column, BOARD_COLUMNS)
  }

  function isInside(row, column) {
    return (
      row >= ZERO &&
      row < BOARD_ROWS &&
      column >= ZERO &&
      column < BOARD_COLUMNS
    )
  }

  function isOccupied(row, column) {
    return isInside(row, column) && entityAt[indexOf(row, column)] !== EMPTY
  }

  function getEntityIdAt(row, column) {
    return isInside(row, column) ? entityAt[indexOf(row, column)] : EMPTY
  }

  function occupy(row, column, id) {
    if (!isInside(row, column) || population >= MAX_POPULATION) {
      return false
    }

    const index = indexOf(row, column)

    if (entityAt[index] !== EMPTY) {
      return false
    }

    entityAt[index] = id
    population += ONE
    return true
  }

  function vacate(row, column) {
    if (!isOccupied(row, column)) {
      return
    }

    entityAt[indexOf(row, column)] = EMPTY
    population -= ONE
  }

  function canAddAnimal() {
    return population < MAX_POPULATION
  }

  function getAvailableNeighbors(coords) {
    return neighbors(coords, [BOARD_ROWS, BOARD_COLUMNS]).filter(
      ([row, column]) => !isOccupied(row, column),
    )
  }

  function getRandomNeighbor(coords) {
    const available = getAvailableNeighbors(coords)
    return available[Math.floor(random() * available.length)]
  }

  function reset(entities) {
    entityAt.fill(EMPTY)
    population = ZERO

    for (const id in entities) {
      const entity = entities[id]

      if (entity.type === FOX || entity.type === RABBIT) {
        entityAt[indexOf(entity.row, entity.column)] = id
        population += ONE
      }
    }
  }

  return {
    canAddAnimal,
    getAvailableNeighbors,
    getEntityIdAt,
    getRandomNeighbor,
    isOccupied,
    occupy,
    reset,
    vacate,
  }
}

export function toPosition(row, column) {
  return v(
    BOARD_X + column * CELL_SIZE + CELL_SIZE / TWO,
    ZERO,
    BOARD_Z - row * CELL_SIZE - CELL_SIZE / TWO,
  )
}

export function createAnimal(grid, type, row, column) {
  const id = `${type.toLowerCase()}-${nextAnimalId++}`

  if (!grid.occupy(row, column, id)) {
    return undefined
  }

  return {
    id,
    type,
    row,
    column,
    age: randomInitialAge(type),
    energy: SPECIES[type].initialEnergy,
    isDying: false,
    position: toPosition(row, column),
  }
}

export function createInitialAnimals(grid) {
  const animals = {}

  for (let row = ZERO; row < BOARD_ROWS; row += ONE) {
    for (let column = ZERO; column < BOARD_COLUMNS; column += ONE) {
      const value = random()
      const type =
        value < FOX_INITIAL_THRESHOLD
          ? FOX
          : value < INITIAL_ANIMAL_THRESHOLD
            ? RABBIT
            : EMPTY

      if (type) {
        const animal = createAnimal(grid, type, row, column)

        if (animal) {
          animals[animal.id] = animal
        }
      }
    }
  }

  grid.reset(animals)
  return animals
}

export function findAdjacentRabbit(entity, grid, api) {
  const adjacent = neighbors(
    [entity.row, entity.column],
    [BOARD_ROWS, BOARD_COLUMNS],
  )

  for (const [row, column] of adjacent) {
    const preyId = grid.getEntityIdAt(row, column)

    if (!preyId) {
      continue
    }

    const prey = api.getEntity(preyId)

    if (prey?.type === RABBIT && !prey.isDying) {
      return prey
    }
  }

  return undefined
}

function randomInitialAge(type) {
  return Math.floor(random() * SPECIES[type].maxAge)
}
