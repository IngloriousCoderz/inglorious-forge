# my-app

A new app created with [@inglorious/create-app](https://www.npmjs.com/package/@inglorious/create-app). There is no build step: `index.html` loads Inglorious Web from a CDN through an import map.

## Getting Started

Browsers only load modules over HTTP, so serve the folder rather than opening `index.html` as a file:

```sh
npx serve
```

Then edit the files in `src/` and reload the page.
