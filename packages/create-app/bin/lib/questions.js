import prompts from "prompts"

import { AUTH_METHODS } from "./auth.js"
import { ICON_PACKS, LANGUAGES, THEMES } from "./features.js"

/**
 * Asks about the app's features, skipping any a command-line flag answered.
 * Resolves to null when the user cancels.
 *
 * @param {ReturnType<import("./cli.js").parseCliOptions>} flags
 */
export async function askAppFeatures(flags) {
  let canceled = false
  const onCancel = () => {
    canceled = true
    return false
  }
  const ask = async (question) => {
    const answers = await prompts({ ...question, name: "value" }, { onCancel })
    return answers.value
  }

  const features = {
    ui: false,
    theme: "inglorious",
    mobile: false,
    ci: false,
    routing: false,
    transitions: false,
    icons: [],
    languages: [],
    analytics: false,
    auth: false,
    authMethods: [],
    push: false,
    pwa: false,
  }

  features.ui =
    flags.ui ??
    (await ask({
      type: "confirm",
      message: "Use Inglorious UI?",
      initial: true,
    }))
  if (canceled) return null

  if (features.ui) {
    features.theme =
      flags.theme ??
      (await ask({
        type: "select",
        message: "Which theme?",
        choices: Object.entries(THEMES).map(([value, theme]) => ({
          value,
          ...theme,
        })),
      }))
    if (canceled) return null
  }

  features.mobile =
    flags.mobile ??
    (await ask({
      type: "confirm",
      message: "Is it a mobile app? (adds Capacitor for Android and iOS)",
      initial: false,
    }))
  if (canceled) return null

  if (features.mobile) {
    features.ci =
      flags.ci ??
      (await ask({
        type: "confirm",
        message:
          "Build and upload store releases on GitHub Actions? (no Mac needed)",
        initial: false,
      }))
    if (canceled) return null
  }

  features.routing =
    flags.routing ??
    (await ask({
      type: "confirm",
      message: "Add routing?",
      initial: true,
    }))
  if (canceled) return null

  if (features.routing && features.ui) {
    features.transitions =
      flags.transitions ??
      (await ask({
        type: "confirm",
        message: "Animate page transitions?",
        initial: true,
      }))
    if (canceled) return null
  }

  if (features.ui) {
    features.icons =
      flags.icons ??
      (await ask({
        type: "multiselect",
        message: "Which icon packs?",
        hint: "Space to select, Enter to confirm. None is fine too.",
        instructions: false,
        choices: Object.entries(ICON_PACKS).map(([value, pack]) => ({
          value,
          title: pack.title,
          selected: value === "material",
        })),
      }))
    if (canceled) return null
  }

  const i18n =
    flags.i18n ??
    (flags.languages ? Boolean(flags.languages.length) : null) ??
    (await ask({
      type: "confirm",
      message: "Translate the app into several languages?",
      initial: false,
    }))
  if (canceled) return null

  if (i18n) {
    features.languages =
      flags.languages ?? (await askLanguages(ask, () => canceled))
    if (canceled || !features.languages) return null
  }

  features.analytics =
    flags.analytics ??
    (await ask({
      type: "confirm",
      message: "Add analytics with a consent prompt? (Firebase)",
      initial: false,
    }))
  if (canceled) return null

  features.auth =
    flags.auth ??
    (flags.authMethods ? Boolean(flags.authMethods.length) : null) ??
    (await ask({
      type: "confirm",
      message: "Add sign-in? (Supabase Auth)",
      initial: false,
    }))
  if (canceled) return null

  if (features.auth) {
    features.authMethods =
      flags.authMethods ??
      (await ask({
        type: "multiselect",
        message: "How do people sign in?",
        hint: "Space to select, Enter to confirm.",
        instructions: false,
        min: 1,
        choices: Object.entries(AUTH_METHODS).map(([value, method]) => ({
          value,
          title: method.title,
          description: method.description,
          selected: value === "password",
        })),
      }))
    if (canceled) return null
  }

  features.push =
    flags.push ??
    (await ask({
      type: "confirm",
      message:
        "Add push notifications? (Firebase and Supabase, turns on PWA support)",
      initial: false,
    }))
  if (canceled) return null

  if (features.push && flags.pwa === false) {
    throw new Error("--push needs the service worker that --no-pwa turns off.")
  }

  features.pwa =
    features.push ||
    (flags.pwa ??
      (await ask({
        type: "confirm",
        message: "Enable PWA support?",
        initial: false,
      })))
  if (canceled) return null

  return validate(features)
}

async function askLanguages(ask, isCanceled) {
  const languages = await ask({
    type: "multiselect",
    message: "Which languages?",
    hint: "Space to select, Enter to confirm.",
    instructions: false,
    min: 1,
    choices: Object.entries(LANGUAGES).map(([value, language]) => ({
      value,
      title: language.title,
      selected: value === "en",
    })),
  })
  if (isCanceled()) return null
  const [, ...others] = languages
  if (!others.length) return languages

  const defaultLanguage = await ask({
    type: "select",
    message: "Which is the default language?",
    choices: languages.map((value) => ({
      value,
      title: LANGUAGES[value].title,
    })),
  })
  if (isCanceled()) return null
  return [defaultLanguage, ...languages.filter((l) => l !== defaultLanguage)]
}

function validate(features) {
  if (!THEMES[features.theme]) {
    throw new Error(
      `Unknown theme "${features.theme}". Choose one of: ${Object.keys(THEMES).join(", ")}.`,
    )
  }
  const unknownIcons = features.icons.filter((key) => !ICON_PACKS[key])
  if (unknownIcons.length) {
    throw new Error(
      `Unknown icon packs: ${unknownIcons.join(", ")}. Choose from: ${Object.keys(ICON_PACKS).join(", ")}.`,
    )
  }
  const unknownLanguages = features.languages.filter((key) => !LANGUAGES[key])
  if (unknownLanguages.length) {
    throw new Error(
      `Unknown languages: ${unknownLanguages.join(", ")}. Choose from: ${Object.keys(LANGUAGES).join(", ")}.`,
    )
  }
  const unknownMethods = features.authMethods.filter(
    (key) => !AUTH_METHODS[key],
  )
  if (unknownMethods.length) {
    throw new Error(
      `Unknown sign-in methods: ${unknownMethods.join(", ")}. Choose from: ${Object.keys(AUTH_METHODS).join(", ")}.`,
    )
  }
  if (features.auth && !features.authMethods.length) {
    throw new Error("--auth needs at least one of --auth-methods.")
  }
  if (!features.routing || !features.ui) features.transitions = false
  if (!features.ui) features.icons = []
  if (!features.mobile) features.ci = false
  return features
}
