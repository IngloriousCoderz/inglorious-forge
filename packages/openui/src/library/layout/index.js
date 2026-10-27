import { Accordion, AccordionItem } from "./accordion.js"
import { Carousel } from "./carousel.js"
import { Modal } from "./modal.js"
import { Separator } from "./separator.js"
import { Stack } from "./stack.js"
import { Steps, StepsItem } from "./steps.js"
import { TabItem, Tabs } from "./tabs.js"

export const layoutGroup = {
  name: "Layout",
  components: [
    Stack,
    Separator,
    Tabs,
    TabItem,
    Accordion,
    AccordionItem,
    Steps,
    StepsItem,
    Carousel,
    Modal,
  ],
  notes: [
    "- Tabs for alternative views of one subject; Accordion for sections the user opens one by one.",
    "- Carousel for a row of like items to browse, such as products: each slide is a list of components.",
    '- Show a Modal by setting its $variable: Button("Edit", @Set($editing, true)) with Modal("Edit", $editing, [content]).',
  ],
}
