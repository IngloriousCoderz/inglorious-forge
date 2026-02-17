import { expect, test } from "@playwright/test"

const TOAST_BATCH = 3
const ZERO = 0
const ONE = 1
const MAX_SHUFFLE_TRIES = 6

test("renders core sections", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "@inglorious/motion" }),
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "Motion Type" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Presence Demo" }),
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "Layout FLIP" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Shared Layout (layoutId)" }),
  ).toBeVisible()
})

test("motion panel toggles persistent variant classes", async ({ page }) => {
  await page.goto("/")

  const motionHost = page.locator(".demo-motion").first()
  const toggleButton = page.getByRole("button", { name: "Toggle variant" })

  await toggleButton.click()
  await expect(motionHost).toHaveClass(/demo-motion--variant-hidden/)

  await toggleButton.click()
  await expect(motionHost).toHaveClass(/demo-motion--variant-visible/)
})

test("presence wait removes all toasts without leftovers", async ({ page }) => {
  await page.goto("/")

  const addToast = page.getByRole("button", { name: "Add toast" })
  for (let i = ZERO; i < TOAST_BATCH; i += ONE) {
    await addToast.click()
  }

  const dismissButtons = page.getByRole("button", { name: "Dismiss" })
  await expect(dismissButtons).toHaveCount(TOAST_BATCH)

  for (let i = ZERO; i < TOAST_BATCH; i += ONE) {
    await dismissButtons.first().click()
  }

  await expect(dismissButtons).toHaveCount(ZERO)
  await expect(page.locator(".toast")).toHaveCount(ZERO)
  await expect(page.locator(".demo-toast")).toHaveCount(ZERO)
})

test("layout shuffle changes card order", async ({ page }) => {
  await page.goto("/")

  const labels = page.locator(".layout-card strong")
  const getOrder = async () => labels.allTextContents()
  const initialOrder = await getOrder()

  const shuffle = page.getByRole("button", { name: "Shuffle layout" })

  let changed = false
  for (let i = ZERO; i < MAX_SHUFFLE_TRIES; i += ONE) {
    await shuffle.click()
    const nextOrder = await getOrder()
    if (nextOrder.join("|") !== initialOrder.join("|")) {
      changed = true
      break
    }
  }

  expect(changed).toBe(true)
})

test("shared layout toggles both directions without runtime errors", async ({
  page,
}) => {
  const pageErrors = []
  page.on("pageerror", (error) => {
    pageErrors.push(error)
  })

  await page.goto("/")

  // Extra interaction to reproduce previously flaky timing paths.
  await page
    .locator(".layout-card")
    .first()
    .getByRole("button", { name: "Pulse" })
    .click()

  await page.getByRole("button", { name: "Show expanded" }).click()
  await expect(page.locator(".shared-pill.expanded")).toHaveCount(ONE)

  await page.getByRole("button", { name: "Show compact" }).click()
  await expect(page.locator(".shared-pill.compact")).toHaveCount(ONE)

  expect(pageErrors).toEqual([])
})
