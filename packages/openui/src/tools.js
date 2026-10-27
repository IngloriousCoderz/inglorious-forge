import { extractToolResult, ToolNotFoundError } from "@openuidev/lang-core"

/**
 * @typedef {import('../types').ToolProvider} ToolProvider
 * @typedef {(name: string, args: Record<string, unknown>) => Promise<unknown>} CallTool
 */

/**
 * One way to call a tool, whatever the app passed: an MCP client, whose
 * results are unwrapped from MCP's content blocks, or a map of async
 * functions by tool name.
 * @param {ToolProvider | undefined} provider
 * @returns {CallTool | null}
 */
export function toCallTool(provider) {
  if (!provider) return null

  if (typeof provider.callTool === "function") {
    return async (name, args) =>
      extractToolResult(await provider.callTool({ name, arguments: args }))
  }

  return async (name, args) => {
    const tool = provider[name]
    if (typeof tool !== "function") {
      throw new ToolNotFoundError(name, Object.keys(provider))
    }
    return tool(args)
  }
}

/**
 * What a query is asked: its tool and arguments, as one string. A change in
 * an argument, such as a `$variable` it reads, changes the key and so
 * fetches again.
 * @param {string} tool
 * @param {unknown} args
 */
export function queryKey(tool, args) {
  return `${tool}::${stableStringify(args)}`
}

/** JSON with object keys sorted, so equal arguments give equal strings. */
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  if (value && typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    return `{${entries.join(",")}}`
  }
  return JSON.stringify(value) ?? "null"
}
