import { createRender } from "../../stories/notifyStory.js"
import { FileUpload } from "./index.js"

export default {
  title: "Controls/FileUpload",
  tags: ["autodocs"],
  render: createRender(FileUpload),
  argTypes: {
    label: {
      control: "text",
      description: "Field label rendered above the upload area.",
    },
    name: {
      control: "text",
      description: "Native HTML file input name attribute.",
    },
    accept: {
      control: "text",
      description: "Accepted file types, such as .pdf,.png,image/*.",
    },
    isMultiple: {
      control: "boolean",
      description: "Allows selecting multiple files.",
    },
    hint: {
      control: "text",
      description: "Helper text shown below the field when there is no error.",
    },
    error: {
      control: "text",
      description: "Validation message shown below the field.",
    },
    isDisabled: {
      control: "boolean",
      description: "Disables user input and interaction.",
    },
    isRequired: {
      control: "boolean",
      description: "Marks the field as required.",
    },
    isFullWidth: {
      control: "boolean",
      description: "Expands the upload area width to 100% of its container.",
    },
    selectedFiles: {
      control: "object",
      description: "Current list of selected file names for display.",
    },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Upload area for files with native input semantics, validation, and a clean drag-and-drop style.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  label: "Resume",
  name: "resume",
  accept: ".pdf,.doc,.docx",
  isMultiple: false,
  hint: "Upload your resume in PDF or DOC format.",
  error: "",
  isDisabled: false,
  isRequired: false,
  isFullWidth: false,
  selectedFiles: [],
  title: "Choose file",
  description: "or drag and drop here",
}

export const Selected = {}
Selected.args = {
  ...Default.args,
  label: "Attachments",
  isMultiple: true,
  selectedFiles: ["brief.pdf", "notes.md"],
}

export const Error = {}
Error.args = {
  ...Default.args,
  label: "Invoice",
  error: "Only PDF files under 5MB are allowed.",
  selectedFiles: ["invoice.png"],
}
