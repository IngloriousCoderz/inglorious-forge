// The app's components as Vue single-file components, compiled to lit-html by
// @inglorious/vite-plugin-vue. Imported Inglorious UI components are tags with
// props; imported .vue components with `v-bind="id"` render store entities;
// script values that read `api` are computed on every render.

import { importBlock } from "./imports.js"
import { LINE_WIDTH } from "./source.js"

export const extension = () => "vue"

export function appSource(app, { pages, navIcons }) {
  const imports = []
  if (navIcons) {
    for (const icon of Object.values(navIcons)) {
      imports.push(`import ${icon.name} from "${icon.from}"`)
    }
    imports.push('import { Icon } from "@inglorious/ui/icon"')
  }
  if (app.ui) {
    imports.push(
      'import { AppBar } from "@inglorious/ui/app-bar"',
      'import { Container } from "@inglorious/ui/container"',
    )
    if (app.tabs) {
      imports.push(
        'import { BottomNavigation } from "@inglorious/ui/bottom-navigation"',
      )
    }
    if (app.links) imports.push('import { Link } from "@inglorious/ui/link"')
    if (app.i18n) imports.push('import { Select } from "@inglorious/ui/select"')
  }
  if (app.i18n) imports.push('import { t } from "./i18n"')

  const locals = []
  if (app.routing) locals.push('const router = api.getEntity("router")')
  if (app.i18n) locals.push('const i18n = api.getEntity("i18n")')

  const content = app.routing
    ? "api.render(router.route)"
    : 'api.render("home")'
  const label = (key, text) => (app.i18n ? `{{ t("${key}") }}` : text)
  const quotedLabel = (key, text) => (app.i18n ? `t('${key}')` : `'${text}'`)

  const template = app.ui
    ? uiShell(app, { label, quotedLabel, pages, content })
    : plainShell(app, { label, pages, content })

  return `${script(imports, locals)}<template>
${template}
</template>
`
}

function script(imports, locals) {
  if (!imports.length && !locals.length) return ""
  const parts = []
  if (imports.length) parts.push(importBlock(imports))
  if (locals.length) parts.push(locals.join("\n"))
  return `<script>
${parts.join("\n\n")}
</script>

`
}

function uiShell(app, { label, quotedLabel, pages, content }) {
  const nav = []
  if (app.links) {
    nav.push(
      ...pages.map(
        (page) =>
          `        <Link href="${page.path}">${label(page.key, page.text)}</Link>`,
      ),
    )
  }
  if (app.i18n) {
    nav.push(`        <Select
          :value="i18n.locale"
          :options="i18n.languages"
          size="sm"
          :aria-label="t('language')"
          :onChange="(locale) => api.notify('#i18n:localeChange', locale)"
        />`)
  }
  const navBlock = nav.length
    ? `
      <nav class="app-nav">
${nav.join("\n")}
      </nav>
    `
    : ""
  const appBar = nav.length
    ? `<AppBar title="${app.projectName}">${navBlock}</AppBar>`
    : `<AppBar title="${app.projectName}" />`

  const header = `  <header${app.mobile ? ' class="pt-safe"' : ""}>
    ${appBar}
  </header>
  <main>
    <Container maxWidth="md">{{ ${content} }}</Container>
  </main>`

  if (!app.tabs) return header

  // Each action on one line when it fits, one property per line otherwise.
  const actions = pages.map((page) => {
    const fields = [
      `value: '${page.path}'`,
      `label: ${quotedLabel(page.key, page.text)}`,
    ]
    if (page.icon) {
      fields.push(`icon: Icon.render({ icon: ${page.icon.name}, size: 'lg' })`)
    }
    const line = `        { ${fields.join(", ")} },`
    if (line.length <= LINE_WIDTH) return line
    return `        {
${fields.map((field) => `          ${field},`).join("\n")}
        },`
  })

  return `${header}
  <footer class="pb-safe">
    <BottomNavigation
      :value="router.path"
      :actions="[
${actions.join("\n")}
      ]"
      :onChange="(path) => api.notify('#router:navigate', path)"
    />
  </footer>`
}

function plainShell(app, { label, pages, content }) {
  const nav = app.routing
    ? pages.map(
        (page) =>
          `      <a href="${page.path}">${label(page.key, page.text)}</a>`,
      )
    : []
  if (app.i18n) {
    nav.push(`      <select
        :aria-label="t('language')"
        @change="
          (event) => api.notify('#i18n:localeChange', event.target.value)
        "
      >
        <option
          v-for="language in i18n.languages"
          :key="language.value"
          :value="language.value"
          :selected="language.value === i18n.locale"
        >
          {{ language.label }}
        </option>
      </select>`)
  }
  const navBlock = nav.length
    ? `
    <nav class="app-nav">
${nav.join("\n")}
    </nav>`
    : ""

  return `  <header>
    <strong>${app.projectName}</strong>${navBlock}
  </header>
  <main>{{ ${content} }}</main>`
}

export function homeSource(app, { showcase }) {
  const imports = ['import { Message } from "../types/message.vue"']
  for (const icon of showcase) {
    imports.push(`import ${icon.name} from "${icon.from}"`)
  }
  if (showcase.length) {
    imports.push('import { Icon } from "@inglorious/ui/icon"')
  }
  if (app.i18n) imports.push('import { t } from "../i18n"')

  const text = (key, fallback) => (app.i18n ? `{{ t("${key}") }}` : fallback)
  const icons = showcase.length
    ? `
  <p class="app-icons">
${showcase
  .map(
    (icon) =>
      `    <Icon :icon="${icon.name}" size="lg" label="${icon.label}" />`,
  )
  .join("\n")}
  </p>`
    : ""

  return `${script(imports, [])}<template>
  <h1>${text("home.title", "Welcome")}</h1>
  <p>
    <Message v-bind="message1" />, <Message v-bind="message2" />,
    <Message v-bind="message3" />!
  </p>
  <p>${text("home.hint", "Click a greeting to shout it.")}</p>${icons}
</template>
`
}

export function aboutSource(app) {
  const imports = app.i18n ? ['import { t } from "../i18n"'] : []
  const text = (key, fallback) => (app.i18n ? `{{ t("${key}") }}` : fallback)
  return `${script(imports, [])}<template>
  <h1>${text("about.title", "About")}</h1>
  <p>${text("about.body", "A page of its own, at its own address.")}</p>
</template>
`
}

export function messageSource(app) {
  const imports = app.i18n ? ['import { t } from "../i18n"'] : []
  const who = "entity.isUpperCase ? entity.who.toUpperCase() : entity.who"
  const span = app.i18n
    ? `  <span @click="click">{{
    t("message.hello", {
      who: ${who},
    })
  }}</span>`
    : `  <span @click="click"
    >Hello
    {{ ${who} }}</span
  >`
  const scriptBody = [
    ...(imports.length ? [importBlock(imports), ""] : []),
    "const click = (entity) => (entity.isUpperCase = !entity.isUpperCase)",
  ]
  return `<script>
${scriptBody.join("\n")}
</script>

<template>
${span}
</template>
`
}
