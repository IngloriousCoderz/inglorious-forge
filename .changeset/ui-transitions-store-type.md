---
"@inglorious/ui": patch
---

`withTransitions` is typed as returning the store it was given, so in TypeScript its result can be passed to `mount`.
