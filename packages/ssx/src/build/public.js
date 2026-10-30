import fs from "node:fs/promises"
import path from "node:path"

/**
 * Copies the contents of the public directory to the output directory.
 *
 * @param {Object} options - Build options.
 * @param {string} [options.outDir="dist"] - The output directory.
 * @param {string} [options.publicDir="public"] - The public assets directory (relative to CWD).
 * @returns {Promise<void>}
 */
export async function copyPublicDir(options = {}) {
  const { outDir = "dist", publicDir = "public" } = options

  const publicPath = path.join(process.cwd(), publicDir)
  const publicExists = await fs
    .access(publicPath)
    .then(() => true)
    .catch(() => false)

  if (publicExists) {
    console.log("📁 Copying public assets...\n")
    await copyDir(publicPath, outDir)
  }
}

/**
 * Recursively copies a directory.
 *
 * @param {string} src - Source directory path.
 * @param {string} dest - Destination directory path.
 * @returns {Promise<void>}
 */
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}
