# @inglorious/create-app

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official scaffolding tool to quickly create a new web app with the [@inglorious/web](https://www.npmjs.com/package/@inglorious/web) framework or a static site with [@inglorious/ssx](https://www.npmjs.com/package/@inglorious/ssx).

This package allows you to generate a new project from a set of pre-configured templates, so you can start developing your web app right away.

## Usage

To create a new app, run one of the following commands in your terminal. You will be prompted to choose a project name and select a template.

```bash
# with npm
npm create @inglorious/app@latest

# with yarn
yarn create @inglorious/app

# with pnpm
pnpm create @inglorious/app
```

The CLI will guide you through the setup process, asking for a project name and which template you'd like to use.

For the JavaScript and TypeScript Vite templates, the CLI then asks about the app's features:

| Question                  | Flag                                                 | Adds                                                                                                       |
| ------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Use Inglorious UI?        | `--ui` / `--no-ui`                                   | `@inglorious/ui`, its base styles and an app bar                                                           |
| Which theme?              | `--theme=inglorious\|material\|bootstrap`            | The theme's stylesheet and class                                                                           |
| Is it a mobile app?       | `--mobile` / `--no-mobile`                           | Capacitor for Android and iOS; with Inglorious UI, a bottom tab bar and safe-area spacing                  |
| Add routing?              | `--routing` / `--no-routing`                         | The Router, a home and an about page, and navigation between them                                          |
| Animate page transitions? | `--transitions` / `--no-transitions`                 | View transitions between pages (with routing and Inglorious UI)                                            |
| Which icon packs?         | `--icons=material,fontawesome,lucide` / `--no-icons` | Iconify icon sets, drawn by Inglorious UI's `Icon` (with Inglorious UI)                                    |
| Translate the app?        | `--i18n` / `--no-i18n`, `--languages=en,it`          | `@inglorious/i18n`, a catalogue per language and a language picker; the first language is the default      |
| Enable PWA support?       | `--pwa` / `--no-pwa`                                 | `vite-plugin-pwa`, a manifest, icons, and a service worker that keeps installed apps on the latest version |

The app is generated in the syntax you chose: lit-html, JSX or Vue. Every question answered on the command line is skipped, so a project can be created without any prompt:

| Question                    | Argument or flag                             |
| --------------------------- | -------------------------------------------- |
| What is your project named? | The first argument, such as `my-app`         |
| Select a template           | `--template=minimal\|js\|ts\|ssx-js\|ssx-ts` |
| Select a rendering syntax   | `--syntax=lit-html\|jsx\|vue`                |

```bash
npm create @inglorious/app@latest -- my-app --template=ts --syntax=jsx --ui --theme=material --routing --transitions --icons=material --languages=en,it --no-mobile --no-pwa
```

## Templates

The following templates are available to get you started:

- **minimal**: A minimal starter template that requires no bundling: just HTML, CSS, and JS.
- **js**: A starter template for a plain JavaScript project, bundled with Vite.
- **ts**: A starter template for a plain TypeScript project, bundled with Vite.
- **ssx-js**: A starter template for a Static Site Xecution (SSX) project using JavaScript.
- **ssx-ts**: A starter template for a Static Site Xecution (SSX) project using TypeScript.

## What it does

The tool will create a new directory with your chosen project name and copy the template files into it. It will also automatically update the `package.json` with your project's name.

After the project is created, you can navigate into the directory and install the dependencies.

```bash
# 1. Change into your new project directory
cd my-awesome-app

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

When mobile support is enabled, initialize the native platforms once, then build and sync them with:

```bash
# Run one or both commands once, depending on the platforms you need
pnpm mobile:init:android
pnpm mobile:init:ios

pnpm mobile:sync

# Build and open the native app
pnpm mobile:android
# or
pnpm mobile:ios
```

For Android and iOS builds, install Android Studio with the Android SDK and a Java runtime compatible with Capacitor. Capacitor currently works reliably with JDK 21, so prefer JDK 21 over newer Java versions if you hit Java compatibility issues. Set `JAVA_HOME` to your JDK 21 install and `ANDROID_HOME` to your Android SDK path before running the native app. See the official Capacitor setup guides for platform-specific instructions:

- Android: https://capacitorjs.com/docs/android
- iOS: https://capacitorjs.com/docs/ios
- Android Studio: https://developer.android.com/studio

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
