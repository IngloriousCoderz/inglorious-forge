import { neighbors } from "@inglorious/utils/data-structures/board"
import { random } from "@inglorious/utils/math/rng"

import { BOARD_COLUMNS, BOARD_ROWS, EMPTY } from "../constants.js"
import { createLifeGame } from "../game.js"
import { createGrid, place } from "../grid.js"
import {
  FOX_INITIAL_THRESHOLD,
  INITIAL_ANIMAL_THRESHOLD,
  SPECIES,
} from "./constants.js"
import { createFox } from "./types/fox.js"
import { createRabbit } from "./types/rabbit.js"

/**
 * Foxes and rabbits: each animal eats, ages and breeds on its own, and the world is
 * whatever results from all of them happening at once.
 */
export function createFoxesAndRabbits({ animals } = {}) {
  const grid = createGrid()
  const initialAnimals = placeAnimals(grid, animals || scatterAcrossTheBoard())

  return createLifeGame({
    types: {
      Fox: createFox(grid),
      Rabbit: createRabbit(grid),
    },
    entities: initialAnimals,
  })
}

export function createAnimal(grid, type, row, column) {
  const animal = place(grid, type, row, column)

  if (!animal) {
    return undefined
  }

  return {
    ...animal,
    age: randomInitialAge(type),
    energy: SPECIES[type].initialEnergy,
  }
}

/**
 * Puts the animals on the board, putting each one where it was asked for and skipping
 * any whose square is already taken.
 *
 * @param {Object} grid - The board to put them on.
 * @param {Array[]} animals - Each one as `[type, row, column]`.
 * @returns {Object} The animals that found a square.
 */
export function placeAnimals(grid, animals) {
  const placed = {}

  for (const [type, row, column] of animals) {
    const animal = createAnimal(grid, type, row, column)

    if (animal) {
      placed[animal.id] = animal
    }
  }

  grid.reset(placed)
  return placed
}

/** A few foxes and a good many rabbits, scattered thinly over an empty board. */
function scatterAcrossTheBoard() {
  const animals = []

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let column = 0; column < BOARD_COLUMNS; column += 1) {
      const value = random()
      const type =
        value < FOX_INITIAL_THRESHOLD
          ? "Fox"
          : value < INITIAL_ANIMAL_THRESHOLD
            ? "Rabbit"
            : EMPTY

      if (type) {
        animals.push([type, row, column])
      }
    }
  }

  return animals
}

/** The empty squares beside a square, which is where a fox or a rabbit can go. */
export function getAvailableNeighbors(grid, coords) {
  return neighbors(coords, [BOARD_ROWS, BOARD_COLUMNS]).filter(
    ([row, column]) => !grid.isOccupied(row, column),
  )
}

/** Somewhere to go, picked at random, or nothing at all if the animal is boxed in. */
export function getRandomNeighbor(grid, coords) {
  const available = getAvailableNeighbors(grid, coords)
  return available[Math.floor(random() * available.length)]
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

    if (prey?.type === "Rabbit" && !prey.isDying) {
      return prey
    }
  }

  return undefined
}

function randomInitialAge(type) {
  return Math.floor(random() * SPECIES[type].maxAge)
}
