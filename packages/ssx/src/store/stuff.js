import { existsSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

export async function getStoreStuff(name, options, loader) {
  const { rootDir = "." } = options
  const srcDir = path.join(rootDir, "src")

  const load = loader || ((p) => import(pathToFileURL(p)))

  const stuff = {}
  const extensions = ["js", "ts"]

  for (const ext of extensions) {
    const stuffPath = path.join(srcDir, "store", `${name}.${ext}`)

    if (existsSync(stuffPath)) {
      try {
        const module = await load(stuffPath)
        if (module[name]) {
          Object.assign(stuff, module[name])
        }
        break
      } catch {
        // ignore and try next extension
      }
    }
  }

  return stuff
}

export async function getTypes(options, loader) {
  const { rootDir = "." } = options
  const srcDir = path.join(rootDir, "src")

  const load = loader || ((p) => import(pathToFileURL(p)))

  const types = {}
  const extensions = ["js", "ts"]

  for (const ext of extensions) {
    const typesPath = path.join(srcDir, "store", `types.${ext}`)

    if (existsSync(typesPath)) {
      try {
        const module = await load(typesPath)
        if (module.types) {
          Object.assign(types, module.types)
        }
        break
      } catch {
        // ignore and try next extension
      }
    }
  }

  return types
}

export async function getEntities(options, loader) {
  const { rootDir = "." } = options
  const srcDir = path.join(rootDir, "src")

  const load = loader || ((p) => import(pathToFileURL(p)))

  const entities = {}
  const extensions = ["js", "ts"]

  for (const ext of extensions) {
    const entitiesPath = path.join(srcDir, "store", `entities.${ext}`)

    if (existsSync(entitiesPath)) {
      try {
        const module = await load(entitiesPath)
        if (module.entities) {
          Object.assign(entities, module.entities)
        }
        break
      } catch {
        // ignore and try next extension
      }
    }
  }

  return entities
}
