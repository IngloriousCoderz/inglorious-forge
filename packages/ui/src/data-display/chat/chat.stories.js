import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notify-story.js"
import { Chat } from "."

/** A chat fills its container, which sets its height. */
const withHeight = (story) => {
  const frame = document.createElement("div")
  frame.style.height = "28rem"
  const chat = story()
  chat.style.height = "100%"
  frame.append(chat)
  return frame
}

const conversation = [
  { id: "m1", role: "user", content: "Where did my money go this month?" },
  {
    id: "m2",
    role: "assistant",
    content:
      "Rent took €900 of the €1,076 you spent. Food came next, at €173, then transport at €58.",
  },
  { id: "m3", role: "user", content: "How can I spend less on food?" },
]

export default {
  title: "Data Display/Chat",
  tags: ["autodocs"],
  render: createEntityRender({ Chat }),
  decorators: [withHeight],
  argTypes: {
    ...notifyActionArgType,
    messages: {
      control: "object",
      description:
        "Messages: `{ id, role, content }`, or `{ id, role, entity }` to render another entity, such as a generated answer.",
    },
    draft: { control: "text", description: "What the user is typing." },
    isBusy: {
      control: "boolean",
      description: "A reply is on its way: shows it, and holds sending.",
    },
    error: { control: "text", description: "Why the last reply failed." },
    suggestions: {
      control: "object",
      description: "Messages to start with, while the chat is empty.",
    },
    placeholder: { control: "text" },
    sendLabel: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A conversation and a box to write in. The chat keeps the messages and the draft; the app answers by handling `messageSend`, and adds replies with `messageAdd`, `replyStart` and `replyEnd`. Enter sends, Shift+Enter starts a new line.",
      },
    },
  },
}

export const Default = {
  args: { id: "chat", type: "Chat", messages: conversation },
}

export const Suggestions = {
  args: {
    id: "chatSuggestions",
    type: "Chat",
    messages: [],
    suggestions: [
      "Where did my money go this month?",
      "Show my food expenses",
      "I want to add an expense",
    ],
  },
}

export const Replying = {
  args: { ...Default.args, id: "chatReplying", isBusy: true },
}

export const Failed = {
  args: {
    ...Default.args,
    id: "chatFailed",
    error: "Could not reach the model. Is Ollama running?",
  },
}
