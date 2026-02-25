import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { select } from "."

const options = [
  { label: "Italy", value: "it" },
  { label: "France", value: "fr" },
  { label: "Spain", value: "es" },
  { label: "Germany", value: "de" },
]

export default {
  title: "Controls/Select",
  tags: ["autodocs"],
  render: makeStoryRender({ select }),
  argTypes: {
    ...notifyActionArgType,
    label: { control: "text", description: "Field label." },
    selectedValue: {
      control: "object",
      description: "Current selection. Value or array of values in multi mode.",
    },
    isMulti: { control: "boolean", description: "Enable multiple selection." },
    isOpen: {
      control: "boolean",
      description: "Controls dropdown visibility.",
    },
    isSearchable: { control: "boolean", description: "Show search input." },
    isClearable: { control: "boolean", description: "Show clear button." },
    isDisabled: { control: "boolean", description: "Disable the control." },
    isLoading: { control: "boolean", description: "Show loading state." },
    searchTerm: { control: "text", description: "Current search filter." },
    placeholder: { control: "text", description: "Placeholder text." },
    noOptionsMessage: { control: "text", description: "No results message." },
    loadingMessage: { control: "text", description: "Loading message." },
    fullWidth: {
      control: "boolean",
      description: "Expand to container width.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Control size.",
    },
    options: { control: "object", description: "Available options." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Theme-aware custom select with searchable dropdown, clear action, and optional multi-selection.",
      },
    },
  },
}

export const SingleClosed = {}
SingleClosed.args = {
  id: "select",
  type: "select",
  label: "Country",
  selectedValue: "it",
  isMulti: false,
  isOpen: false,
  isSearchable: true,
  isClearable: true,
  isDisabled: false,
  isLoading: false,
  searchTerm: "",
  placeholder: "Select...",
  noOptionsMessage: "No options",
  loadingMessage: "Loading...",
  fullWidth: false,
  size: "md",
  options,
}

export const SingleOpen = {}
SingleOpen.args = {
  ...SingleClosed.args,
  isOpen: true,
}

export const MultiOpen = {}
MultiOpen.args = {
  ...SingleClosed.args,
  isMulti: true,
  selectedValue: ["it", "fr"],
  isOpen: true,
}
