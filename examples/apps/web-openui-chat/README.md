# web-openui-chat

A chat whose answers are interfaces: a local model answers in [OpenUI Lang](https://openui.com/docs/openui-lang), and `@inglorious/openui` renders each answer with Inglorious UI components as it streams in. Buttons in an answer can set values on it or ask the model a follow-up.

It talks to a local [Ollama](https://ollama.com), so it costs nothing to run.

Quick start:

```bash
ollama pull qwen3:8b

# from repository root
cd examples/apps/web-openui-chat
pnpm install
pnpm dev
```

Another model, or Ollama elsewhere, through `.env.local`:

```bash
VITE_OLLAMA_MODEL=qwen3:14b
VITE_OLLAMA_URL=http://localhost:11434
```

Small models get the syntax right thanks to the examples in `uiExamples`, but they still slip at times, such as defining a section and forgetting to show it. A larger model follows the prompt more closely.
