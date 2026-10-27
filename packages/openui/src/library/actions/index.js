import { Button, Buttons } from "./button.js"
import { FollowUpBlock, FollowUpItem } from "./follow-up.js"
import { IconButton } from "./icon-button.js"

export const actionsGroup = {
  name: "Actions",
  components: [Button, Buttons, IconButton, FollowUpBlock, FollowUpItem],
  notes: [
    '- End an answer with what the user may ask next: FollowUpBlock([FollowUpItem("Show last month")])',
  ],
}
