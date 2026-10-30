export function parseCliOptions(args) {
  return {
    projectName: args.find((arg) => !arg.startsWith("-")) ?? null,
    template: readValueFlag(args, "template"),
    syntax: readValueFlag(args, "syntax"),
    mobile: readBooleanFlag(args, "mobile"),
    pwa: readBooleanFlag(args, "pwa"),
    ui: readBooleanFlag(args, "ui"),
    theme: readValueFlag(args, "theme"),
    routing: readBooleanFlag(args, "routing"),
    transitions: readBooleanFlag(args, "transitions"),
    icons: readListFlag(args, "icons"),
    i18n: readBooleanFlag(args, "i18n"),
    languages: readListFlag(args, "languages"),
    skills: readBooleanFlag(args, "skills"),
  }
}

export function readBooleanFlag(args, name) {
  if (args.includes(`--${name}`)) {
    return true
  }

  if (args.includes(`--no-${name}`)) {
    return false
  }

  return null
}

export function readValueFlag(args, name) {
  const prefix = `--${name}=`
  const arg = args.find((value) => value.startsWith(prefix))
  return arg ? arg.slice(prefix.length) : null
}

export function readListFlag(args, name) {
  if (args.includes(`--no-${name}`)) {
    return []
  }

  const value = readValueFlag(args, name)
  if (value === null) {
    return null
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}
