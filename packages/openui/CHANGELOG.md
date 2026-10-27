# @inglorious/openui

## 0.1.0

### Minor Changes

- New package: generative UI for Inglorious Web. A model answers in OpenUI Lang and the answer renders with Inglorious UI components as it streams in. `createOpenUI({ library })` returns the type for an answer entity, streamed with `streamStart`, `chunk` and `streamEnd`; its `$variables` and fields live in the entity, and what the answer asks of the app is announced as `openuiAction`. `uiLibrary` offers Stack, Separator, Card, CardHeader, TextContent, Callout, Tag, Image, Button, Buttons, Table, Col and Input, under the names OpenUI's standard library uses, and `uiExamples` holds example answers to pass with its prompt, which small local models need. `Query` and `Mutation` are not supported yet.
