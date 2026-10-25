import addressBookRegular from "@iconify-icons/fa7-regular/address-book"
import addressBookSolid from "@iconify-icons/fa7-solid/address-book"
import arrowBack from "@iconify-icons/material-symbols/arrow-back"
import settingsFilled from "@iconify-icons/material-symbols/settings"
import settingsOutline from "@iconify-icons/material-symbols/settings-outline"

import { createRender } from "../../stories/notify-story.js"
import { Icon } from "."

export default {
  title: "Data Display/Icon",
  tags: ["autodocs"],
  render: createRender(Icon),
  argTypes: {
    icon: {
      control: false,
      description:
        "An Iconify icon, imported from a set such as `@iconify-icons/material-symbols`.",
    },
    children: {
      control: "text",
      description: "Shown when there is no `icon`: a glyph or inline content.",
    },
    direction: {
      control: "inline-radio",
      options: ["ltr", "rtl"],
      description:
        "The direction of the surrounding text. An icon that points along the line is mirrored with `rtl`.",
    },
    label: {
      control: "text",
      description:
        "Names an icon that means something on its own. Without it the icon is decorative.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Icon size scale.",
    },
    color: {
      control: "text",
      description:
        "Any valid CSS color value (`current` keeps inherited color).",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Draws an icon from any Iconify set as inline SVG, or a glyph. See `Data Display/Icon/Implementations` for the icon sets.",
      },
    },
  },
}

export const FontAwesomeRegular = {
  args: { icon: addressBookRegular, size: "lg", color: "current" },
}

export const FontAwesomeSolid = {
  args: { icon: addressBookSolid, size: "lg", color: "current" },
}

export const MaterialOutline = {
  args: { icon: settingsOutline, size: "lg", color: "current" },
}

export const MaterialFilled = {
  args: { icon: settingsFilled, size: "lg", color: "current" },
}

export const RightToLeft = {
  args: { icon: arrowBack, size: "lg", direction: "rtl" },
}

export const CustomIcon = {
  args: {
    children: "★",
    size: "md",
    color: "current",
  },
}
