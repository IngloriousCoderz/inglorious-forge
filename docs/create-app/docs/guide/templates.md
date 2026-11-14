---
title: Templates and Syntaxes
description: The project templates and the three template syntaxes
---

# Templates and Syntaxes

## Templates

| Template  | What it is                                                                                            | App features |
| --------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| `minimal` | A single HTML file with no build step: open `index.html` in a browser                                 | No           |
| `js`      | A JavaScript app bundled with Vite                                                                    | Yes          |
| `ts`      | A TypeScript app bundled with Vite                                                                    | Yes          |
| `ssx-js`  | A site pre-rendered with [SSX](https://inglorious.dev/ssx/), static or server-rendered, in JavaScript | No           |
| `ssx-ts`  | The same, in TypeScript                                                                               | No           |

The app features (UI, mobile, routing, sign-in and the rest) belong to the `js` and `ts` templates. Pick SSX for content sites where pages should arrive as HTML; pick `js` or `ts` for apps, and for everything native.

## Syntaxes

Every template but `minimal` comes in three syntaxes, all rendering through lit-html underneath:

| Syntax     | Flag                | Looks like                                                            |
| ---------- | ------------------- | --------------------------------------------------------------------- |
| lit-html   | `--syntax=lit-html` | `` html`<p>${entity.who}</p>` ``                                      |
| JSX or TSX | `--syntax=jsx`      | `<p>{entity.who}</p>`, through `@inglorious/vite-plugin-jsx`          |
| Vue        | `--syntax=vue`      | Vue-like single-file templates, through `@inglorious/vite-plugin-vue` |

The generated app, features included, is written in the syntax you pick. A few generated pieces that are plain functions, such as the analytics and push prompts and the update page, stay in lit-html in every syntax.
