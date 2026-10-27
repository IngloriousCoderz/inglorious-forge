import { Callout, TextCallout } from "./callout.js"
import { Card, CardHeader, InlineHeader } from "./card.js"
import { CodeBlock } from "./code-block.js"
import { Icon } from "./icon.js"
import { Image, ImageBlock, ImageGallery } from "./image.js"
import { Tag, TagBlock } from "./tag.js"
import { MarkDownRenderer, TextContent } from "./text.js"

export const contentGroup = {
  name: "Content",
  components: [
    Card,
    CardHeader,
    InlineHeader,
    TextContent,
    MarkDownRenderer,
    Callout,
    TextCallout,
    CodeBlock,
    Tag,
    TagBlock,
    Icon,
    Image,
    ImageBlock,
    ImageGallery,
  ],
  notes: [
    '- Group related figures in Cards, side by side in a Stack with direction "row" and wrap true.',
    '- A KPI: Card([TextContent("Revenue", "small"), TextContent("€12,400", "large-heavy")])',
    "- Callout is for news the user caused, such as a saved form, and hides itself when bound to a $variable; TextCallout is a note that stays.",
  ],
}
