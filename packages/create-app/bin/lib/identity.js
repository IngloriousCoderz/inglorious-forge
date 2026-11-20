import {
  AFTER_FIRST_CHARACTER_INDEX,
  FIRST_CHARACTER_INDEX,
} from "./constants.js"
import { toJavaIdentifier } from "./file.js"

// Characters that would break the generated source, where the name is written
// inside quotes, HTML and template literals.
const UNSAFE_NAME = /["'`$<>{}\\]/
const APP_ID = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/

/**
 * The name people see: in the app bar, the page title, the PWA manifest and
 * under the icon on a phone. The project's folder name, in words:
 * `walka-walka` becomes `Walka Walka`.
 *
 * @param {string} projectName
 */
export function displayNameOf(projectName) {
  return projectName
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(FIRST_CHARACTER_INDEX).toUpperCase() +
        word.slice(AFTER_FIRST_CHARACTER_INDEX),
    )
    .join(" ")
}

/**
 * A starting point for the reverse-domain id that identifies the app in the
 * stores: `walka-walka` becomes `com.walkawalka.app`.
 *
 * @param {string} projectName
 */
export function defaultAppIdOf(projectName) {
  return `com.${toJavaIdentifier(projectName).toLowerCase()}.app`
}

/**
 * True, or the reason the name can't be used.
 *
 * @param {string} name
 */
export function validateAppName(name) {
  if (!name.trim()) return "The app needs a name."
  if (UNSAFE_NAME.test(name)) {
    return "Leave out quotes, backslashes and the characters $ < > { }."
  }
  return true
}

/**
 * True, or the reason the id can't be used. Android allows letters, digits
 * and underscores in each part, starting with a letter, so the id works on
 * both platforms.
 *
 * @param {string} appId
 */
export function validateAppId(appId) {
  if (APP_ID.test(appId)) return true
  return "Use a reverse domain, such as com.example.myapp: two or more parts separated by dots, each starting with a letter, with only letters, digits and underscores."
}
