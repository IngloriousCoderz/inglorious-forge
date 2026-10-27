import { CompositeCardBlock, CompositeCardItem } from "./composite-card.js"
import { ContextCardBlock, ContextCardItem } from "./context-card.js"
import { IconText } from "./icon-text.js"
import { ImageText, ImageTextLarge } from "./image-text.js"
import {
  MetricIndicatorInline,
  MetricIndicatorWithStrikethrough,
} from "./metric-indicator.js"
import { OverviewCardBlock, OverviewCardItem } from "./overview-card.js"
import { SnippetCardBlock, SnippetCardItem } from "./snippet-card.js"
import { BoldText, Text } from "./text.js"
import { VisualCardBlock, VisualCardItem } from "./visual-card.js"

export const cardsGroup = {
  name: "Cards",
  components: [
    SnippetCardBlock,
    SnippetCardItem,
    OverviewCardBlock,
    OverviewCardItem,
    ContextCardBlock,
    ContextCardItem,
    CompositeCardBlock,
    CompositeCardItem,
    VisualCardBlock,
    VisualCardItem,
    Text,
    BoldText,
    IconText,
    ImageText,
    ImageTextLarge,
    MetricIndicatorInline,
    MetricIndicatorWithStrikethrough,
  ],
  notes: [
    "- A card block lays out two or more items of one kind, two a row or in a carousel: SnippetCardBlock for short facts, OverviewCardBlock for KPIs, ContextCardBlock for summaries, CompositeCardBlock for products or offers, VisualCardBlock for photos.",
    "- Text, BoldText, IconText, ImageText, ImageTextLarge and the MetricIndicators are the parts of card items; put them in items, not straight in a Card.",
    '- KPIs: OverviewCardBlock([OverviewCardItem("rev", IconText(Icon("euro"), "success", "m", "Revenue"), MetricIndicatorInline("€12,400", "this month", {direction: "up", value: 8})), ...])',
  ],
}
