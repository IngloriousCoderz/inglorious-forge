import { execSync } from "child_process"

const SKILLS_REPOSITORY = "IngloriousCoderz/forge-skills"

/**
 * The agent skills for the packages a new project uses.
 *
 * @param {{ baseTemplate: string, renderer: string, ui: boolean, languages: string[] }} project
 */
export function skillsFor({ baseTemplate, renderer, ui, languages }) {
  const skills = [
    "forge",
    "forge-best-practices",
    "store",
    "web",
    "web-best-practices",
  ]
  if (baseTemplate.startsWith("ssx-")) skills.push("ssx")
  if (renderer === "jsx") skills.push("vite-plugin-jsx")
  if (renderer === "vue") skills.push("vite-plugin-vue")
  if (ui) skills.push("ui", "ui-best-practices")
  if (languages.length) skills.push("i18n")
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
