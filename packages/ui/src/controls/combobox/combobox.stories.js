import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notify-story.js"
import { Combobox } from "./index.js"

const options = [
  { label: "Italy", value: "it" },
  { label: "France", value: "fr" },
  { label: "Spain", value: "es" },
  { label: "Germany", value: "de" },
]

export default {
  title: "Controls/Combobox",
  tags: ["autodocs"],
  render: createEntityRender({ Combobox }),
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
    searchPlaceholder: {
      control: "text",
      description: "Placeholder of the search box in the panel.",
    },
    noOptionsMessage: { control: "text", description: "No results message." },
    loadingMessage: { control: "text", description: "Loading message." },
    isFullWidth: {
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

export const Default = {}
Default.args = {
  id: "combobox",
  type: "Combobox",
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
  isFullWidth: false,
  size: "md",
  options,
}

export const SingleOpen = {}
SingleOpen.args = {
  ...Default.args,
  isOpen: true,
}

export const MultiOpen = {}
MultiOpen.args = {
  ...Default.args,
  isMulti: true,
  selectedValue: ["it", "fr"],
  isOpen: true,
}

export const WithHint = {}
WithHint.args = {
  ...Default.args,
  hint: "Please select a country",
}

export const WithError = {}
WithError.args = {
  ...Default.args,
  error: "You cannot select this one!",
}

export const WithHintAndError = {}
WithHintAndError.args = {
  ...WithHint.args,
  error: "You cannot select this one!",
}

export const Required = {}
Required.args = {
  ...Default.args,
  isRequired: true,
}

export const Disabled = {}
Disabled.args = {
  ...Default.args,
  isDisabled: true,
}

export const DisabledOption = {}
DisabledOption.args = {
  ...Default.args,
  options: Default.args.options.map((option, index) =>
    index % 2 ? { ...option, isDisabled: true } : option,
  ),
}

export const Small = {}
Small.args = {
  ...Default.args,
  size: "sm",
}

export const Medium = {}
Medium.args = {
  ...Default.args,
  size: "md",
}

export const Large = {}
Large.args = {
  ...Default.args,
  size: "lg",
}

export const FullWidth = {}
FullWidth.args = {
  ...Default.args,
  isFullWidth: true,
}
