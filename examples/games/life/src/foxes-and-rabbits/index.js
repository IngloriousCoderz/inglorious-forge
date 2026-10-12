import { neighbors } from "@inglorious/utils/data-structures/board"
import { random } from "@inglorious/utils/math/rng"

import { BOARD_COLUMNS, BOARD_ROWS, EMPTY } from "../constants.js"
import { createLifeGame } from "../game.js"
import { createGrid, place } from "../grid.js"
import { createRules } from "./constants.js"
import { describeSliders } from "./parameters.js"
import { createFox } from "./types/fox.js"
import { createRabbit } from "./types/rabbit.js"

/**
 * Foxes and rabbits: each animal eats, ages and breeds on its own, and the world is
 * whatever results from all of them happening at once.
 */
export function createFoxesAndRabbits({ animals, fps } = {}) {
  const grid = createGrid()
  const rules = createRules()
  const initialAnimals = placeAnimals(
    grid,
    animals || scatterAcrossTheBoard(rules.start),
    rules,
  )

  return createLifeGame({
    types: {
      Fox: createFox(grid, rules, { fps }),
      Rabbit: createRabbit(grid, rules, { fps }),
      Board: [restarting(grid, rules)],
    },
    entities: initialAnimals,

    readout: (entities) => {
      const { foxes, rabbits } = countAnimals(entities)
      return `${foxes} foxes - ${rabbits} rabbits`
    },

    parameters: rules,
    sliders: describeSliders(rules),
  })
}

export function createAnimal(grid, type, row, column, rules) {
  const animal = place(grid, type, row, column)

  if (!animal) {
    return undefined
  }

  return {
    ...animal,
    age: randomInitialAge(type, rules),
    energy: rules[type].initialEnergy,
  }
}

/**
 * Puts the animals on the board, putting each one where it was asked for and skipping
 * any whose square is already taken.
 *
 * @param {Object} grid - The board to put them on.
 * @param {Array[]} animals - Each one as `[type, row, column]`.
 * @param {Object} rules - The numbers this world is living by.
 * @returns {Object} The animals that found a square.
 */
export function placeAnimals(grid, animals, rules) {
  const placed = {}

  for (const [type, row, column] of animals) {
    const animal = createAnimal(grid, type, row, column, rules)

    if (animal) {
      placed[animal.id] = animal
    }
  }

  grid.reset(placed)
  return placed
}

/**
 * Puts the board back to a fresh scattering of animals.
 *
 * As in Conway's, the squares are freed before anything new is put on them, so nothing
 * is ever asked to stand somewhere another animal is already standing.
 */
function restarting(grid, rules) {
  return {
    reset(entity, event, api) {
      for (const [id, animal] of Object.entries(api.getEntities())) {
        if (animal.type !== "Fox" && animal.type !== "Rabbit") continue

        grid.vacate(animal.row, animal.column)
        api.notify("remove", id)
      }

      for (const animal of Object.values(
        placeAnimals(grid, scatterAcrossTheBoard(rules.start), rules),
      )) {
        api.notify("add", animal)
      }
    },
  }
}

/** How many of each animal there are. */
function countAnimals(entities) {
  const animals = Object.values(entities).filter((entity) =>
    ["Fox", "Rabbit"].includes(entity.type),
  )

  return {
    foxes: animals.filter((animal) => animal.type === "Fox").length,
    rabbits: animals.filter((animal) => animal.type === "Rabbit").length,
  }
}

/** A few foxes and a good many rabbits, scattered thinly over an empty board. */
function scatterAcrossTheBoard(startingRules) {
  const animals = []

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let column = 0; column < BOARD_COLUMNS; column += 1) {
      const value = random()
      const type =
        value < startingRules.fox
          ? "Fox"
          : value < startingRules.rabbit
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

function randomInitialAge(type, rules) {
  return Math.floor(random() * rules[type].maxAge)
}
