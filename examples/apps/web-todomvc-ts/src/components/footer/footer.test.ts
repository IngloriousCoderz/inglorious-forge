import { type Event, trigger } from "@inglorious/web"
import { expect, it } from "vitest"

import type { FooterEntity, FooterType } from "../../../types"
import { footer } from "./footer"

it("should update the filter on filterClick", () => {
  const entityBefore: FooterEntity = {
    id: "footer",
    type: "footer",
    activeFilter: "all",
  }
  const event: Event = { type: "filterClick", payload: "completed" }
  const entityAfter: FooterEntity = {
    id: "footer",
    type: "footer",
    activeFilter: "completed",
  }

  const { entity } = trigger(
    entityBefore,
    footer[event.type as keyof typeof footer] as FooterType["filterClick"],
    event.payload,
  ) as unknown as { entity: FooterEntity }

  expect(entity).toEqual(entityAfter)
})
