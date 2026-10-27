import { createLibrary } from "@openuidev/lang-core"

import { uiLibrary } from "../index.js"
import { ChatCard } from "./card.js"
import { SectionBlock, SectionItem } from "./section-block.js"

/** What a chat answer has no use for: it is always one Card, in a column. */
const LEFT_OUT = new Set(["Stack", "Card"])

/**
 * Inglorious UI as OpenUI's chat library: an answer is a single Card, its
 * content one under the other, with sections and sources for long, researched
 * answers. Pass `chatRules` and `chatExamples` to its prompt, and add the
 * charts as for `uiLibrary`.
 */
export const chatLibrary = createLibrary({
  root: "Card",
  components: [
    ChatCard,
    SectionBlock,
    SectionItem,
    ...Object.values(uiLibrary.components).filter(
      ({ name }) => !LEFT_OUT.has(name),
    ),
  ],
  componentGroups: [
    {
      name: "Answer",
      components: ["Card", "SectionBlock", "SectionItem"],
      notes: [
        "- Every answer is one Card([...]): its children stack top to bottom. There is no Stack.",
        '- Divide a long answer into topics with SectionBlock([SectionItem("intro", "Introduction", [...])]).',
        "- With real sources, pass them to the Card and cite them in TextContent as [1], [2].",
      ],
    },
    ...(uiLibrary.componentGroups ?? []).map((group) => ({
      ...group,
      components: group.components.filter((name) => !LEFT_OUT.has(name)),
      notes: (group.notes ?? []).filter((note) => !note.includes("Stack")),
    })),
  ],
})

/** Rules for a chat answer's prompt: `chatLibrary.prompt({ additionalRules: chatRules })`. */
export const chatRules = [
  "Every response is a single Card(children): children stack vertically. Do not use Stack; use Tabs to switch between views and Carousel to scroll sideways.",
  "Start the Card with a CardHeader; use InlineHeader to label a block inside it.",
  "End the Card with a FollowUpBlock of what the user may ask next.",
  "Use SectionBlock to divide a long answer into independent topics; never as the Card's first child.",
  "Card blocks (SnippetCardBlock, OverviewCardBlock, ContextCardBlock, CompositeCardBlock, VisualCardBlock) need at least 2 items of the same structure. Their action is shared by every card: keep its message generic, as the clicked card's details are attached.",
  "Text, BoldText, IconText, ImageText, ImageTextLarge and the MetricIndicators go inside card items, never straight in the Card.",
  "Every image needs a real URL from a tool, the conversation or the user. Never invent one: without one, compose with icons, gray ContextCardItems and charts.",
  "Pass sources on the Card only for references you actually have, and cite them in TextContent as [1], [2].",
  "Quantitative questions get a chart, with KPI cards where useful, in the first answer.",
  "Use EditableTable only when asked for an editable table; Table otherwise.",
]

/** Example answers in the chat library's shape, for its prompt. */
export const chatExamples = [
  `root = Card([header, intro, kpis, sections, next], [{title: "Visitor statistics 2024", sourceName: "Paris Tourist Office", url: "https://www.parisinfo.com"}])
header = CardHeader("Paris", "The City of Light")
intro = TextContent("Paris welcomed **48.7 million** visitors in 2024 [1].")
kpis = OverviewCardBlock([k1, k2])
k1 = OverviewCardItem("visitors", IconText(Icon("users", "people"), "neutral", "m", "Visitors", "2024"), MetricIndicatorInline("48.7M", "tourists", {direction: "up", value: 2.5}))
k2 = OverviewCardItem("museums", IconText(Icon("landmark", "buildings"), "neutral", "m", "Museums"), MetricIndicatorInline("143", "in the city"))
sections = SectionBlock([s1, s2])
s1 = SectionItem("food", "Food & Drink", [TextContent("Over 9,000 restaurants and 130 Michelin stars.")])
s2 = SectionItem("when", "When to Go", [TextContent("Spring brings fewer crowds than summer.")])
next = FollowUpBlock([FollowUpItem("Plan three days in Paris"), FollowUpItem("Where should I stay?")])`,
]
