import { execSync } from "child_process"

const SKILLS_REPOSITORY = "IngloriousCoderz/forge-skills"

/**
 * The agent skills for the packages a new project uses.
 *
 * @param {{ baseTemplate: string, renderer: string, ui: boolean, languages: string[], analytics: boolean, auth: boolean, push: boolean }} project
 */
export function skillsFor({
  baseTemplate,
  renderer,
  ui,
  languages,
  analytics,
  auth,
  push,
}) {
  const skills = [
    "forge",
    "forge-best-practices",
    "app-recipe",
    "store",
    "web",
    "web-best-practices",
  ]
  if (baseTemplate.startsWith("ssx-")) skills.push("ssx")
  if (renderer === "jsx") skills.push("vite-plugin-jsx")
  if (renderer === "vue") skills.push("vite-plugin-vue")
  if (ui) skills.push("ui", "ui-best-practices")
  if (languages.length) skills.push("i18n")
  if (analytics || push) skills.push("firebase")
  if (push || auth) skills.push("supabase")
  return skills
}

/**
 * Installs the skills into the project with the skills CLI, which asks which
 * agents to install them for. Returns false when the install fails.
 *
 * @param {string} targetDir
 * @param {string[]} skills
 */
export function installSkills(targetDir, skills) {
  try {
    execSync(skillsCommand(skills), { cwd: targetDir, stdio: "inherit" })
    return true
  } catch {
    return false
  }
}

export function skillsCommand(skills) {
  return `pnpm dlx skills add ${SKILLS_REPOSITORY} --skill ${skills.join(" ")}`
}
