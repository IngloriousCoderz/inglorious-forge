import { Carousel as UiCarousel } from "@inglorious/ui/carousel"
import { Grid } from "@inglorious/ui/grid"
import { html } from "@inglorious/web"
import { action, ACTION_STEPS } from "@openuidev/lang-core"
import { z } from "zod"

/** Grid gaps by the most pixels each stands for. */
const GAP_STEPS = { none: 0, sm: 8, md: 16, lg: 24 }

const GAP_TOKENS = new Set(["none", "sm", "md", "lg", "xl"])

const FIRST_CARD = 0

/** Cards are counted from one where people read them. */
const HUMAN_OFFSET = 1

/** Cards a row when the grid does not adapt to the screen. */
const FIXED_COLUMNS = 2

/** No fixed number of columns: as many as fit. */
const AUTO_COLUMNS = 0

export const blockProps = (item, layouts = ["grid", "carousel"]) =>
  z.object({
    items: z.array(item.ref),
    layout: z.enum(layouts).optional(),
    responsive: z.boolean().optional(),
    action: action().optional(),
    gap: z.union([z.number(), z.string()]).optional(),
  })

/** A card filled by its photo, the content set over it. */
export function renderPhotoCard(src, alt, content) {
  return html`<div
    role=${alt ? "img" : "presentation"}
    aria-label=${alt ?? ""}
    style="display: flex; min-block-size: 12rem; padding: var(--iw-space-3); border-radius: var(--iw-radius-md); background: var(--iw-color-bg-secondary) center / cover no-repeat; background-image: ${src ? `url("${encodeURI(src)}")` : "none"};"
  >
    <div style="display: flex; flex: 1;">${content}</div>
  </div>`
}

/**
 * A card block: its items in a grid of two a row, narrowing to one on small
 * screens unless `responsive` is false, or in a carousel. With an action,
 * each card runs it, telling the assistant which card it was.
 */
export function renderBlock(
  { props, renderNode, triggerAction, isStreaming, viewState, statementId },
  { renderItem, describe },
) {
  const items = (props.items ?? [])
    .filter(Boolean)
    .map((item) => item.props ?? {})
  const cards = items.map((item, index) => {
    const card = renderItem(item, renderNode)
    if (!props.action || isStreaming) return card

    const details = { itemIndex: index, itemId: item.id, ...describe(item) }
    const label = details.itemTitle ?? item.id ?? `Card ${index + HUMAN_OFFSET}`
    const run = () =>
      triggerAction(label, undefined, withItemContext(props.action, details))
    return html`<div
      role="button"
      tabindex="0"
      style="cursor: pointer;"
      @click=${run}
      @keydown=${(event) => {
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        run()
      }}
    >
      ${card}
    </div>`
  })

  if (props.layout === "carousel") {
    const page = viewState(`${statementId ?? "cards"}:page`, FIRST_CARD)
    return UiCarousel.renderCarousel({
      label: "Cards",
      items: cards,
      page: page.value,
      gap: "md",
      arrowPlacement: "outside",
      isFullWidth: true,
      onPageChange: page.setValue,
    })
  }

  const isResponsive = props.responsive !== false
  return Grid.render({
    columns: isResponsive ? AUTO_COLUMNS : FIXED_COLUMNS,
    minColumnWidth: isResponsive ? "14rem" : "0",
    gap: toGap(props.gap),
    children: cards,
  })
}

/**
 * The block's action, telling which card was picked: added to the context of
 * its steps back to the assistant, or to its params.
 */
function withItemContext(blockAction, details) {
  const context = Object.fromEntries(
    Object.entries(details).filter(([, value]) => value !== undefined),
  )
  if (!("steps" in blockAction)) {
    return { ...blockAction, params: { ...blockAction.params, ...context } }
  }

  const note = `Selected item: ${JSON.stringify(context)}`
  return {
    ...blockAction,
    steps: blockAction.steps.map((step) =>
      step.type === ACTION_STEPS.ToAssistant
        ? { ...step, context: step.context ? `${step.context}\n${note}` : note }
        : step,
    ),
  }
}

function toGap(gap) {
  if (typeof gap === "string") return GAP_TOKENS.has(gap) ? gap : "md"
  if (typeof gap !== "number") return "md"
  const [token = "xl"] =
    Object.entries(GAP_STEPS).find(([, most]) => gap <= most) ?? []
  return token
}
