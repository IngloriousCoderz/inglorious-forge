/**
 * Streams a chat completion from a local Ollama, a piece of text at a time.
 * Any model Ollama serves works; set VITE_OLLAMA_MODEL to pick another one.
 */

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL ?? "http://localhost:11434"
const MODEL = import.meta.env.VITE_OLLAMA_MODEL ?? "qwen3:8b"

// Enough for the library's prompt, its examples and a few turns of history.
const CONTEXT_TOKENS = 8192
// Low, so the model sticks to the syntax it was shown.
const TEMPERATURE = 0.2

/**
 * @param {{ system: string, messages: { role: "user" | "assistant", content: string }[] }} request
 * @returns {AsyncGenerator<string>}
 */
export async function* streamChat({ system, messages }) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      // Reasoning models would otherwise think out loud before answering.
      think: false,
      options: { temperature: TEMPERATURE, num_ctx: CONTEXT_TOKENS },
      messages: [{ role: "system", content: system }, ...messages],
    }),
  })
  if (!response.ok) {
    throw new Error(
      `Ollama answered ${response.status}: ${await response.text()}`,
    )
  }

  // One JSON object per line, each with the next piece of the answer.
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += value
    const lines = buffer.split("\n")
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.trim()) continue
      const data = JSON.parse(line)
      if (data.error) throw new Error(data.error)
      if (data.message?.content) yield data.message.content
    }
  }
}
