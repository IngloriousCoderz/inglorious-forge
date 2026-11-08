export const TEMPLATES = {
  minimal: {
    title: "Minimal",
    description: "A single HTML file for a zero-build setup",
  },
  js: {
    title: "JavaScript",
    description: "A vanilla JavaScript setup with Vite",
  },
  ts: { title: "TypeScript", description: "A TypeScript setup with Vite" },
  "ssx-js": {
    title: "SSX (JavaScript)",
    description: "Static Site Xecution with JavaScript",
  },
  "ssx-ts": {
    title: "SSX (TypeScript)",
    description: "Static Site Xecution with TypeScript",
  },
}

export const SYNTAXES = {
  "lit-html": {
    title: "lit-html (default)",
    description: "Tagged template literals (html`<div>...</div>`)",
  },
  jsx: { title: "JSX", description: "JSX/TSX syntax (<div>...</div>)" },
  vue: { title: "Vue", description: "Vue SFC-style templates" },
}

export const THEMES = {
  inglorious: { title: "Inglorious", description: "Neon, videogame-inspired" },
  "material-ui": { title: "Material UI", description: "Material UI inspired" },
  "material-3": {
    title: "Material 3",
    description: "Material Design 3 inspired",
  },
  bootstrap: { title: "Bootstrap", description: "Bootstrap inspired" },
  "ios-18": { title: "iOS 18", description: "Flat iOS inspired" },
  "ios-26": { title: "iOS 26", description: "Liquid Glass inspired" },
}

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

export const PROMPT_TEXTS = {
  en: {
    analytics: {
      prompt:
        "May we measure how you use this app? It helps us make it better.",
      accept: "Allow",
      decline: "No thanks",
    },
    push: {
      prompt: "Turn on push notifications?",
      ask: "Notify me",
      decline: "Not now",
    },
  },
  it: {
    analytics: {
      prompt: "Possiamo misurare come usi questa app? Ci aiuta a migliorarla.",
      accept: "Consenti",
      decline: "No, grazie",
    },
    push: {
      prompt: "Attivare le notifiche push?",
      ask: "Avvisami",
      decline: "Non ora",
    },
  },
  fr: {
    analytics: {
      prompt:
        "Pouvons-nous mesurer comment vous utilisez cette app\u00a0? Cela nous aide à l'améliorer.",
      accept: "Autoriser",
      decline: "Non merci",
    },
    push: {
      prompt: "Activer les notifications push\u00a0?",
      ask: "Me prévenir",
      decline: "Plus tard",
    },
  },
  de: {
    analytics: {
      prompt:
        "Dürfen wir messen, wie du diese App nutzt? Das hilft uns, sie zu verbessern.",
      accept: "Erlauben",
      decline: "Nein, danke",
    },
    push: {
      prompt: "Push-Benachrichtigungen aktivieren?",
      ask: "Benachrichtigen",
      decline: "Nicht jetzt",
    },
  },
  es: {
    analytics: {
      prompt: "¿Podemos medir cómo usas esta app? Nos ayuda a mejorarla.",
      accept: "Permitir",
      decline: "No, gracias",
    },
    push: {
      prompt: "¿Activar las notificaciones push?",
      ask: "Avisarme",
      decline: "Ahora no",
    },
  },
  pt: {
    analytics: {
      prompt: "Podemos medir como usas esta app? Ajuda-nos a melhorá-la.",
      accept: "Permitir",
      decline: "Não, obrigado",
    },
    push: {
      prompt: "Ativar as notificações push?",
      ask: "Avisar-me",
      decline: "Agora não",
    },
  },
  ja: {
    analytics: {
      prompt: "このアプリの使われ方を計測してもよいですか？改善に役立てます。",
      accept: "許可する",
      decline: "許可しない",
    },
    push: {
      prompt: "プッシュ通知をオンにしますか？",
      ask: "通知する",
      decline: "今はしない",
    },
  },
  ar: {
    analytics: {
      prompt:
        "هل تسمح لنا بقياس طريقة استخدامك لهذا التطبيق؟ يساعدنا ذلك على تحسينه.",
      accept: "سماح",
      decline: "لا، شكرًا",
    },
    push: {
      prompt: "هل تريد تفعيل الإشعارات الفورية؟",
      ask: "أعلمني",
      decline: "ليس الآن",
    },
  },
}

function from(name, source) {
  return { name, from: source }
}

function language(title, texts) {
  return { title, texts }
}

export const NATIVE_UPDATE_TEXTS = {
  en: {
    title: "Time to update",
    body: "This version of the app is no longer supported. Update it to keep going.",
    bodyNoLink:
      "This version of the app is no longer supported. Update it from your app store to keep going.",
    update: "Update",
  },
  it: {
    title: "È ora di aggiornare",
    body: "Questa versione dell'app non è più supportata. Aggiornala per continuare.",
    bodyNoLink:
      "Questa versione dell'app non è più supportata. Aggiornala dal tuo store per continuare.",
    update: "Aggiorna",
  },
  fr: {
    title: "Mise à jour nécessaire",
    body: "Cette version de l'app n'est plus prise en charge. Mettez-la à jour pour continuer.",
    bodyNoLink:
      "Cette version de l'app n'est plus prise en charge. Mettez-la à jour depuis votre store pour continuer.",
    update: "Mettre à jour",
  },
  de: {
    title: "Zeit für ein Update",
    body: "Diese Version der App wird nicht mehr unterstützt. Aktualisiere sie, um weiterzumachen.",
    bodyNoLink:
      "Diese Version der App wird nicht mehr unterstützt. Aktualisiere sie in deinem App Store, um weiterzumachen.",
    update: "Aktualisieren",
  },
  es: {
    title: "Hora de actualizar",
    body: "Esta versión de la app ya no es compatible. Actualízala para continuar.",
    bodyNoLink:
      "Esta versión de la app ya no es compatible. Actualízala desde tu tienda de apps para continuar.",
    update: "Actualizar",
  },
  pt: {
    title: "Hora de atualizar",
    body: "Esta versão da app já não é suportada. Atualiza-a para continuar.",
    bodyNoLink:
      "Esta versão da app já não é suportada. Atualiza-a na tua loja de apps para continuar.",
    update: "Atualizar",
  },
  ja: {
    title: "アップデートが必要です",
    body: "このバージョンのアプリはサポートが終了しました。引き続き使うにはアップデートしてください。",
    bodyNoLink:
      "このバージョンのアプリはサポートが終了しました。引き続き使うにはアプリストアからアップデートしてください。",
    update: "アップデート",
  },
  ar: {
    title: "حان وقت التحديث",
    body: "لم يعد هذا الإصدار من التطبيق مدعومًا. حدّثه للمتابعة.",
    bodyNoLink:
      "لم يعد هذا الإصدار من التطبيق مدعومًا. حدّثه من متجر التطبيقات للمتابعة.",
    update: "تحديث",
  },
}
