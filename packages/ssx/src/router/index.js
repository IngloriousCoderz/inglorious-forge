import path from "node:path"
import { pathToFileURL } from "node:url"

import { glob } from "glob"

import { getModuleName } from "../utils/module.js"

const NEXT_MATCH = 1

const STATIC_SEGMENT_WEIGHT = 3
const CATCH_ALL_ROUTE_WEIGHT = -10
const SCORE_MULTIPLIER = 0.1

/**
 * Scans the pages directory and returns a list of all pages to be built.
 * For dynamic routes, it calls the `staticPaths` export of the page module
 * to generate all possible paths.
 *
 * @param {string} pagesDir - The directory containing page files.
 * @param {Object} [options] - config object with i18n configuration { defaultLocale, locales }.
 * @param {Function} [loader] - Optional loader function (e.g. vite.ssrLoadModule).
 * @returns {Promise<Array<Object>>} A list of page objects with metadata.
 */
export async function getPages(pagesDir = "pages", options, loader) {
  const routes = await getRoutes(pagesDir)
  const pages = []
  const load = loader || ((p) => import(pathToFileURL(path.resolve(p))))

  for (const route of routes) {
    try {
      const module = await load(route.filePath)
      const moduleName = getModuleName(module)

      if (isDynamic(route.pattern)) {
        let { staticPaths = [] } = module
        if (typeof staticPaths === "function") {
          staticPaths = await staticPaths()
        }

        if (staticPaths.length) {
          for (const pathOrObject of staticPaths) {
            const path =
              typeof pathOrObject === "string"
                ? pathOrObject
                : pathOrObject.path

            const params = extractParams(route, path)

            addPages(pages, options, {
              pattern: route.pattern,
              path,
              params,
              moduleName,
              modulePath: route.modulePath,
              filePath: route.filePath,
            })
          }
        } else {
          console.warn(
            `Dynamic route ${route.filePath} has no staticPaths export. ` +
              `It will be skipped during SSG.`,
          )
        }
      } else {
        addPages(pages, options, {
          pattern: route.pattern,
          path: route.pattern || "/",
          params: {},
          module,
          moduleName,
          modulePath: route.modulePath,
          filePath: route.filePath,
        })
      }
    } catch (error) {
      console.error(`\n❌ Failed to load page: ${route.filePath}`)
      throw error
    }
  }

  return pages
}

function addPages(pages, options = {}, pageData) {
  const { i18n = {} } = options

  if (!i18n.locales?.length) {
    pages.push(pageData)
    return
  }

  for (const locale of i18n.locales) {
    const isDefault = locale === i18n.defaultLocale
    const prefix = isDefault ? "" : `/${locale}`

    let localizedPath = prefix + pageData.path
    // Handle root path: / -> / (default), /fr (fr)
    if (pageData.path === "/" && !isDefault) {
      localizedPath = prefix
    }

    pages.push({
      ...pageData,
      path: localizedPath,
      locale,
    })
  }
}

/**
 * Discovers all page files and converts them into route definitions.
 * Routes are sorted by specificity so that more specific routes match first.
 *
 * @param {string} pagesDir - The directory containing page files.
 * @returns {Promise<Array<Object>>} A list of route objects.
 */
export async function getRoutes(pagesDir = "pages") {
  // Find all .js and .ts files in pages directory
  const files = await glob("**/*.{js,ts,jsx,tsx,md}", {
    cwd: pagesDir,
    ignore: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
    posix: true,
  })

  const routes = files.map((file) => {
    const filePath = path.join(pagesDir, file)
    const pattern = filePathToPattern(file)
    const { regex, params } = patternToRegex(pattern)

    return {
      pattern,
      modulePath: file,
      filePath,
      regex,
      params,
    }
  })

  // Sort routes by specificity (most specific first)
  routes.sort((a, b) => {
    const aScore = routeSpecificity(a.pattern)
    const bScore = routeSpecificity(b.pattern)
    return bScore - aScore
  })

  return routes
}

/**
 * Simple route matcher.
 * Checks if a URL matches a route pattern (handling dynamic segments).
 *
 * @param {string} pattern - The route pattern (e.g. "/posts/:id").
 * @param {string} url - The actual URL (e.g. "/posts/123").
 * @returns {boolean} True if it matches.
 */
export function matchRoute(pattern, url) {
  const patternParts = pattern.split("/").filter(Boolean)
  const urlParts = url.split("/").filter(Boolean)

  if (patternParts.length !== urlParts.length) {
    return false
  }

  return patternParts.every((part, i) => {
    if (part.startsWith(":") || part.startsWith("[")) {
      return true
    }
    return part === urlParts[i]
  })
}

/**
 * Converts a file path to a route pattern.
 * Examples:
 * - pages/index.js -> /
 * - pages/about.js -> /about
 * - pages/blog/_slug.js -> /blog/:slug
 * - pages/api/__path.js -> /api/*
 *
 * @param {string} file - The relative file path.
 * @returns {string} The route pattern.
 */
function filePathToPattern(file) {
  let pattern = file
    .replace(/\\/g, "/")
    .replace(/\.(js|ts|jsx|tsx|md)$/, "") // Remove extension
    .replace(/\/index$/, "") // index becomes root of directory
    .replace(/^index$/, "") // Handle root index
    .replace(/__(\w+)/g, "*") // __path becomes *
    .replace(/_(\w+)/g, ":$1") // _id becomes :id

  // Normalize to start with /
  return "/" + pattern.replace(/^\//, "")
}

/**
 * Converts a route pattern to a regex and extracts parameter names.
 *
 * @param {string} pattern - The route pattern.
 * @returns {{regex: RegExp, params: string[]}} The regex and parameter names.
 */
function patternToRegex(pattern) {
  const params = []

  // Replace :param with capture groups
  let regexStr = pattern.replace(/:(\w+)/g, (_, param) => {
    params.push(param)
    return "([^/]+)"
  })

  // Replace * with greedy capture
  regexStr = regexStr.replace(/\*/g, () => {
    params.push("path")
    return "(.*)"
  })

  // Exact match
  regexStr = "^" + regexStr + "$"

  return {
    regex: new RegExp(regexStr),
    params,
  }
}

/**
 * Calculates route specificity for sorting.
 * Higher score = more specific = should match first.
 *
 * @param {string} pattern - The route pattern.
 * @returns {number} The specificity score.
 */
function routeSpecificity(pattern) {
  let score = 0

  // Static segments add 3 points each
  const segments = pattern.split("/").filter(Boolean)
  segments.forEach((segment) => {
    if (!segment.startsWith(":") && segment !== "*") {
      score += STATIC_SEGMENT_WEIGHT
    }
  })

  // Dynamic segments add 1 point
  const dynamicCount = (pattern.match(/:/g) || []).length
  score += dynamicCount

  // Catch-all routes have lowest priority (subtract points)
  if (pattern.includes("*")) {
    score += CATCH_ALL_ROUTE_WEIGHT
  }

  // Longer paths are more specific
  score += segments.length * SCORE_MULTIPLIER

  return score
}

/**
 * Checks if a pattern is dynamic (contains params or wildcards).
 *
 * @param {string} pattern - The route pattern.
 * @returns {boolean} True if dynamic.
 */
function isDynamic(pattern) {
  return pattern.includes(":") || pattern.includes("*")
}

/**
 * Extracts params from a URL based on a route.
 *
 * @param {Object} route - The route object.
 * @param {string} url - The URL to match.
 * @returns {Object} The extracted parameters.
 */
function extractParams(route, url) {
  const match = route.regex.exec(url)
  if (!match) return {}

  const params = {}
  route.params.forEach((param, i) => {
    params[param] = match[i + NEXT_MATCH]
  })

  return params
}
