import { afterEach, describe, expect, it, vi } from "vitest"

import { flush, setup } from "../test-helpers.js"

describe("Action components", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it("labels an IconButton and sends follow-ups as the user's message", async () => {
    const onAction = vi.fn()
    const { container } = await setup({
      onAction,
      icons: { trash: { body: "<path/>", width: 24, height: 24 } },
      response: `root = Stack([IconButton("Delete", Icon("trash"), null, null, null, "circle"), FollowUpBlock([FollowUpItem("Show last month")])])
`,
    })

    const iconButton = container.querySelector('[aria-label="Delete"]')
    expect(iconButton.querySelector("svg")).not.toBeNull()

    const followUp = [...container.querySelectorAll(".iw-button")].find(
      (button) => button.textContent.includes("Show last month"),
    )
    followUp.click()
    await flush()

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "continue_conversation",
        humanFriendlyMessage: "Show last month",
      }),
    )
  })
})
