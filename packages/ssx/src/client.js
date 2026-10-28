// The runtime of the client entry SSX generates, which imports it by package name
// from inside the app. Not meant for apps themselves.
export { getLocaleFromPath, waitForLocale } from "./utils/i18n.js"
export { syncPageHead } from "./utils/page-head.js"
