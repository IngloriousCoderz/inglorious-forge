import { v } from "@inglorious/utils/v.js"

import RendererChooser from "../renderer-chooser.jsx"

export default {
  title: "UI/Form",
  component: RendererChooser,
  args: { renderer: "react" },
}

export const Default = {
  args: {
    config: {
      types: {
        form: {},
      },

      entities: {
        login: {
          type: "form",
          position: v(150, 0, 600 - 160),
          fields: {
            username: {
              label: "Username",
            },
            password: {
              label: "Password",
              inputType: "password",
            },
          },
          groups: {
            extraInfo: {
              title: "Extra Info",
              fields: {
                kids: {
                  label: "How many kids do you have?",
                  inputType: "number",
                  defaultValue: 0,
                },
                dogs: {
                  label: "Do you like dogs?",
                  inputType: "checkbox",
                  defaultValue: true,
                },
                cats: {
                  label: "Do you like cats?",
                  inputType: "checkbox",
                  defaultValue: true,
                },
              },
            },
          },
        },
      },
    },
  },
}
