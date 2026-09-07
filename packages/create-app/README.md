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

For JavaScript and TypeScript Vite app templates, the CLI can also add optional app targets:

```bash
npm create @inglorious/app@latest -- --pwa
npm create @inglorious/app@latest -- --mobile
npm create @inglorious/app@latest -- --pwa --mobile
```

- `--pwa` adds `vite-plugin-pwa`, a basic web app manifest configuration, PWA icons, and browser-only service worker registration.
- `--mobile` adds Capacitor dependencies, config, and mobile scripts for iOS and Android.

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
