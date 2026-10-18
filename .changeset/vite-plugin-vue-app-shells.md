---
"@inglorious/vite-plugin-vue": patch
---

Templates that make up an app shell compile correctly:

- Imported functions keep their name inside `{{ }}`: `{{ t("home.title") }}` calls the imported `t` instead of `entity.t`.
- Inline functions in bound props pass through: `:onChange="(value) => api.notify('#app:select', value)"`.
- An interpolation spread over several lines, as Prettier wraps a long one, is still read as an expression.
- Kebab-case props on components, such as `:aria-label`, are quoted object keys instead of invalid code.
- Several root elements, such as a header, a main and a footer, render as one template instead of producing invalid code.
