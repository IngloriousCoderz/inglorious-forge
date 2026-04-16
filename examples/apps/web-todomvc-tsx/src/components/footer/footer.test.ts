import type { Event } from "@inglorious/store"
import { trigger } from "@inglorious/web/test"
import { expect, it } from "vitest"

import type { FooterEntity, FooterType } from "../../../types"
import { Footer } from "./footer"

it("should update the filter on filterClick", () => {
  const entityBefore: FooterEntity = {
    id: "footer",
    type: "Footer",
    activeFilter: "all",
  }
  const event: Event = { type: "filterClick", payload: "completed" }
  const entityAfter: FooterEntity = {
    id: "footer",
    type: "Footer",
    activeFilter: "completed",
  }

  const { entity } = trigger(
    entityBefore,
    Footer[event.type as keyof typeof Footer] as FooterType["filterClick"],
    event.payload,
  ) as unknown as { entity: FooterEntity }

  expect(entity).toEqual(entityAfter)
})
