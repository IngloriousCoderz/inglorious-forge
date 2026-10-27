# web-openui-chat

A budget assistant whose answers are interfaces: a local model answers in [OpenUI Lang](https://openui.com/docs/openui-lang), and `@inglorious/openui` renders each answer with Inglorious UI components as it streams in.

It shows the whole of the package:

- **Tools.** `src/tools.js` is a small expense book in memory, standing in for a backend. Answers read it with `Query` (`list_expenses`, `expenses_by_category`) and write to it with `Mutation` (`add_expense`).
- **Charts and tables** of the expenses, with `@inglorious/charts`.
- **Forms** whose fields are checked before they save.
- **Icons** from Lucide, through `@iconify-json/lucide`.
- **Follow-ups**: buttons in an answer set values on it or ask the model the next question.
- **The chat** is Inglorious UI's `Chat`, with a behaviour of the app's own (`src/chat.js`) that answers each message: it adds an OpenUI answer and streams the model's reply into it.
- **OpenUI's chat library**: each answer is one card, with sections and follow-ups.

`src/library.js` holds what the model is told: `chatLibrary` with the charts, the tools, examples in the app's own terms, and a few rules small models need said outright.

It talks to a local [Ollama](https://ollama.com), so it costs nothing to run.

Quick start:

```bash
ollama pull qwen3:14b

# from repository root
cd examples/apps/web-openui-chat
pnpm install
pnpm dev
```

Another model, or Ollama elsewhere, through `.env.local`:

```bash
VITE_OLLAMA_MODEL=qwen3:8b
VITE_OLLAMA_URL=http://localhost:11434
```

The prompt is about 10k tokens, so the model gets a 16k context. `qwen3:14b` (about 9 GB) answers questions about the expenses with live charts and tables, and writes forms that save through a mutation, on a laptop with 16 GB. The smaller `qwen3:8b` handles the questions too, but often gets forms that save wrong: it forgets to define the mutation it runs, or the `$variables` its fields bind. The whole of Lucide also goes into the bundle; an app with a few icons would give `createOpenUI` just those.
