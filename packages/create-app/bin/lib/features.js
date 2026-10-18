// The choices create-app offers for lit-html apps, and what each one brings.

export const THEMES = {
  inglorious: { title: "Inglorious", description: "Neon, videogame-inspired" },
  material: { title: "Material", description: "Material Design inspired" },
  bootstrap: { title: "Bootstrap", description: "Bootstrap inspired" },
}

// Icon sets from Iconify: one module per icon, so only the icons an app
// imports are bundled. `nav` names the icons for the two example pages,
// `showcase` the one shown on the home page.
export const ICON_PACKS = {
  material: {
    title: "Material Symbols",
    packages: { "@iconify-icons/material-symbols": "^2.0.6" },
    nav: {
      home: from("homeOutline", "@iconify-icons/material-symbols/home-outline"),
      about: from(
        "infoOutline",
        "@iconify-icons/material-symbols/info-outline",
      ),
    },
    showcase: {
      ...from(
        "favoriteOutline",
        "@iconify-icons/material-symbols/favorite-outline",
      ),
      label: "Material Symbols",
    },
  },
  fontawesome: {
    title: "Font Awesome",
    packages: {
      "@iconify-icons/fa7-solid": "^2.0.0",
      "@iconify-icons/fa7-regular": "^2.0.0",
      "@iconify-icons/fa7-brands": "^2.0.0",
    },
    nav: {
      home: from("house", "@iconify-icons/fa7-solid/house"),
      about: from("circleInfo", "@iconify-icons/fa7-solid/circle-info"),
    },
    showcase: {
      ...from("fontAwesome", "@iconify-icons/fa7-brands/font-awesome"),
      label: "Font Awesome",
    },
  },
  lucide: {
    title: "Lucide",
    packages: { "@iconify-icons/lucide": "^2.0.22" },
    nav: {
      home: from("house", "@iconify-icons/lucide/house"),
      about: from("info", "@iconify-icons/lucide/info"),
    },
    showcase: {
      ...from("sparkles", "@iconify-icons/lucide/sparkles"),
      label: "Lucide",
    },
  },
}

// The languages offered for the example app, with its few texts in each.
export const LANGUAGES = {
  en: language("English", {
    nav: { home: "Home", about: "About" },
    language: "Language",
    home: { title: "Welcome", hint: "Click a greeting to shout it." },
    about: { title: "About", body: "A page of its own, at its own address." },
    message: { hello: "Hello {{who}}" },
  }),
  it: language("Italiano", {
    nav: { home: "Home", about: "Info" },
    language: "Lingua",
    home: { title: "Benvenuto", hint: "Clicca un saluto per urlarlo." },
    about: { title: "Info", body: "Una pagina tutta sua, al suo indirizzo." },
    message: { hello: "Ciao {{who}}" },
  }),
  fr: language("Français", {
    nav: { home: "Accueil", about: "À propos" },
    language: "Langue",
    home: { title: "Bienvenue", hint: "Cliquez sur un salut pour le crier." },
    about: {
      title: "À propos",
      body: "Une page à part entière, à sa propre adresse.",
    },
    message: { hello: "Bonjour {{who}}" },
  }),
  de: language("Deutsch", {
    nav: { home: "Start", about: "Über" },
    language: "Sprache",
    home: {
      title: "Willkommen",
      hint: "Klicke auf einen Gruß, um ihn zu rufen.",
    },
    about: { title: "Über", body: "Eine eigene Seite unter eigener Adresse." },
    message: { hello: "Hallo {{who}}" },
  }),
  es: language("Español", {
    nav: { home: "Inicio", about: "Acerca de" },
    language: "Idioma",
    home: { title: "Bienvenido", hint: "Haz clic en un saludo para gritarlo." },
    about: {
      title: "Acerca de",
      body: "Una página propia, en su propia dirección.",
    },
    message: { hello: "Hola {{who}}" },
  }),
  pt: language("Português", {
    nav: { home: "Início", about: "Sobre" },
    language: "Idioma",
    home: { title: "Bem-vindo", hint: "Clique numa saudação para gritá-la." },
    about: {
      title: "Sobre",
      body: "Uma página própria, no seu próprio endereço.",
    },
    message: { hello: "Olá {{who}}" },
  }),
  ja: language("日本語", {
    nav: { home: "ホーム", about: "概要" },
    language: "言語",
    home: {
      title: "ようこそ",
      hint: "あいさつをクリックすると大きくなります。",
    },
    about: { title: "概要", body: "専用のアドレスを持つ独立したページです。" },
    message: { hello: "こんにちは、{{who}}" },
  }),
  ar: language("العربية", {
    nav: { home: "الرئيسية", about: "حول" },
    language: "اللغة",
    home: { title: "مرحبًا", hint: "انقر على تحية لتكبيرها." },
    about: { title: "حول", body: "صفحة مستقلة بعنوانها الخاص." },
    message: { hello: "مرحبًا {{who}}" },
  }),
}

function from(name, source) {
  return { name, from: source }
}

function language(title, texts) {
  return { title, texts }
}
