/** @typedef {import('@storybook/react-vite').StorybookConfig} StorybookConfig */

import { dirname } from "path"
import remarkGfm from "remark-gfm"
import { fileURLToPath } from "url"

/** @type {StorybookConfig} */
const config = {
  stories: [
    "../src/quick-start/quick-start.mdx",
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      options: {
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
  ],

  framework: getAbsolutePath("@storybook/react-vite"),
}

export default config

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
