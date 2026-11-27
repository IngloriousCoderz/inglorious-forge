import reactConfig from "@inglorious/eslint-config/react"
import typescriptConfig from "@inglorious/eslint-config/typescript"
import { defineConfig } from "eslint/config"

export default defineConfig([...reactConfig, ...typescriptConfig])
