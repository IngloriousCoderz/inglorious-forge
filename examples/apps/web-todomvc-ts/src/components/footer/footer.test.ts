import type { Event } from "@inglorious/store"
import { trigger } from "@inglorious/web/test"
import { expect, it } from "vitest"

import type { FooterEntity } from "../../../types"
import { Footer } from "./footer"

it("should update the filter on filterChange", () => {
  const entityBefore: FooterEntity = {
    id: "footer",
    type: "Footer",
    activeFilter: "all",
  }
  const event: Event = { type: "filterChange", payload: "completed" }
  const entityAfter: FooterEntity = {
    id: "footer",
    type: "Footer",
    activeFilter: "completed",
  }

  const { entity } = trigger(entityBefore, Footer.filterChange, event.payload)

  expect(entity).toEqual(entityAfter)
})
