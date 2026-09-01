export function parseCliOptions(args) {
  return {
    mobile: readBooleanFlag(args, "mobile"),
    pwa: readBooleanFlag(args, "pwa"),
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
