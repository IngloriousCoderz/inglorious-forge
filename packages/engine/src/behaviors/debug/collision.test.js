import { expect, test, vi } from "vitest"

import { collisionGizmos } from "./collision.js"

const GREEN = "#00FF00"

test("it should draw the collision a solid entity really uses", () => {
  const drawn = []
  const ctx = {
    save: vi.fn(),
    restore: vi.fn(),
    drawn,
  }
  const api = { getEntity: () => ({ debug: true }) }
  const render = (entity) => drawn.push(entity)

  const type = { render: vi.fn() }
  const gizmo = collisionGizmos({ shapes: { rectangle: render } })(type)

  // An entity with no declared block at all, only `solid`.
  const ball = { id: "ball", size: [8, 8, 0], solid: true }

  gizmo.render(ball, ctx, api)

  expect(type.render).toHaveBeenCalledWith(ball, ctx, api)
  expect(drawn).toHaveLength(1)
  expect(drawn[0]).toMatchObject({ shape: "rectangle", color: GREEN })
  expect(drawn[0]).toMatchObject({ size: [8, 8, 0] })
})

test("it should draw nothing for an entity with no collision at all", () => {
  const drawn = []
  const ctx = { save: vi.fn(), restore: vi.fn() }
  const api = { getEntity: () => ({ debug: true }) }
  const render = (entity) => drawn.push(entity)

  const gizmo = collisionGizmos({ shapes: { rectangle: render } })({
    render: vi.fn(),
  })

  // A line of text has a size and is not in the way, so it has nothing to draw.
  const label = { id: "paused", size: [32, 32, 0] }

  gizmo.render(label, ctx, api)

  expect(drawn).toHaveLength(0)
})

test("it should keep drawing the declared collisions", () => {
  const drawn = []
  const ctx = { save: vi.fn(), restore: vi.fn() }
  const api = { getEntity: () => ({ debug: true }) }
  const render = (entity) => drawn.push(entity)

  const gizmo = collisionGizmos({ shapes: { rectangle: render } })({
    render: vi.fn(),
  })

  const entity = {
    id: "brick",
    size: [32, 16, 0],
    collisions: {
      hitbox: { shape: "rectangle" },
      touch: { shape: "rectangle", size: [8, 8, 0] },
    },
  }

  gizmo.render(entity, ctx, api)

  expect(drawn).toHaveLength(2)
})
