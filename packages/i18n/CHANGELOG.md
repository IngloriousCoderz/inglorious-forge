# @inglorious/i18n

## 1.0.0

### Major Changes

- New package: internationalization for Inglorious Web. `createI18n` sets up an i18next instance and an `I18n` type whose entity holds the active locale, so changing language is an ordinary store event. It detects the device language, remembers the user's choice and keeps `<html lang>` in sync. `trans` renders translations with markup in them: their tags map to components, and interpolated values stay text.
