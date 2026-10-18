import prompts from "prompts"

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
    routing: false,
    transitions: false,
    icons: [],
    languages: [],
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

  features.pwa =
    flags.pwa ??
    (await ask({
      type: "confirm",
      message: "Enable PWA support?",
      initial: false,
    }))
  if (canceled) return null

  return validate(features)
}

// The languages, with the default first.
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

// Flags can name things that do not exist, or combine what cannot go together.
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
  // Transitions animate navigations, with Inglorious UI's stylesheet; icons
  // are drawn by its Icon component.
  if (!features.routing || !features.ui) features.transitions = false
  if (!features.ui) features.icons = []
  return features
}
