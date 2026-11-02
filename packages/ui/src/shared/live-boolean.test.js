import { render } from "@lit-labs/ssr"
import { collectResult } from "@lit-labs/ssr/lib/render-result.js"
import { describe, expect, it } from "vitest"

import { Checkbox } from "../controls/checkbox/index.js"
import { RadioGroup } from "../controls/radio-group/index.js"
import { Select } from "../controls/select/index.js"
import { Switch } from "../controls/switch/index.js"

const serverRender = (template) => collectResult(render(template))

describe("server rendering", () => {
  it("marks only the chosen option as selected", async () => {
    const markup = await serverRender(
      Select.render({ id: "lang", value: "en", options: ["en", "it"] }),
    )
    expect(markup).not.toMatch(/selected="/)
    expect(markup.match(/<option[^>]*\sselected[\s>]/g)).toHaveLength(1)
    expect(markup).toMatch(/value="en"\s+selected/)
  })

  it("marks every chosen option of a multiple select", async () => {
    const markup = await serverRender(
      Select.render({
        isMulti: true,
        value: ["a", "c"],
        options: ["a", "b", "c"],
      }),
    )
    expect(markup.match(/<option[^>]*\sselected[\s>]/g)).toHaveLength(2)
  })

  it("leaves unchecked controls unchecked", async () => {
    const markup = await serverRender(
      [
        Checkbox.render({ id: "terms", isChecked: false }),
        Switch.render({ id: "alerts", isChecked: false }),
        RadioGroup.render({ id: "size", value: "s", options: ["s", "m"] }),
      ].map(String),
    )
    expect(markup).not.toMatch(/checked="/)
  })
})
