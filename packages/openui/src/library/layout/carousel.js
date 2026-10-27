import { Card as UiCard } from "@inglorious/ui/card"
import { Carousel as UiCarousel } from "@inglorious/ui/carousel"
import { Flex } from "@inglorious/ui/flex"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

const FIRST_SLIDE = 0

export const Carousel = defineComponent({
  name: "Carousel",
  description:
    'Slides scrolled through sideways, each a list of components: Carousel([[img1, title1], [img2, title2]]). variant "card" (default) or "sunk" is the surface each slide sits on.',
  props: z.object({
    children: z.array(z.array(z.any())),
    variant: z.enum(["card", "sunk"]).optional(),
  }),
  component: ({ props, renderNode, viewState, statementId }) => {
    const page = viewState(`${statementId ?? "carousel"}:page`, FIRST_SLIDE)
    const surface = props.variant === "sunk" ? "sunk" : "default"
    return UiCarousel.renderCarousel({
      label: "Carousel",
      items: (props.children ?? []).filter(Boolean).map((slide) =>
        UiCard.render({
          variant: surface,
          children: Flex.render({
            direction: "column",
            gap: "sm",
            children: renderNode(slide),
          }),
        }),
      ),
      page: page.value,
      gap: "md",
      // Inside, the arrows would cover the slides' own text.
      arrowPlacement: "outside",
      isFullWidth: true,
      onPageChange: page.setValue,
    })
  },
})
