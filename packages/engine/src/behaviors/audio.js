const DEFAULT_VOLUME = 1

export function audio() {
  const audioBufferCache = new Map()
  const activeSources = new Map()

  // The context is made when something first asks for sound rather than when this is
  // called, because the engine's own default configuration builds every behaviour as it is
  // imported -- and a module that reaches for `window` on the way in cannot be imported
  // where there is no window, which is anywhere a test runs.
  let audioContext

  function context() {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)()

    return audioContext
  }

  function resume() {
    window.removeEventListener("pointerdown", resume)
    window.removeEventListener("keydown", resume)
    context().resume()
  }

  function release() {
    window.removeEventListener("pointerdown", resume)
    window.removeEventListener("keydown", resume)

    for (const source of activeSources.values()) {
      source.stop()
    }

    activeSources.clear()
  }

  return {
    create() {
      // Browsers keep an AudioContext suspended until the user interacts with
      // the page, so playback would be silently dropped until then.
      window.addEventListener("pointerdown", resume)
      window.addEventListener("keydown", resume)
    },

    async init(entity) {
      const sounds = entity.sounds || {}

      await Promise.all(
        Object.entries(sounds).map(([name, { url }]) =>
          load(context(), audioBufferCache, name, url),
        ),
      )
    },

    soundPlay(entity, name) {
      const { volume = DEFAULT_VOLUME, loop } = entity.sounds[name] || {}
      const audioBuffer = audioBufferCache.get(name)

      if (!audioBuffer) return

      activeSources.get(name)?.stop()

      const source = context().createBufferSource()
      const gainNode = context().createGain()

      source.buffer = audioBuffer
      gainNode.gain.value = volume

      source.connect(gainNode)
      gainNode.connect(context().destination)

      source.loop = loop
      source.start()

      activeSources.set(name, source)
    },

    soundStop(entity, name) {
      const source = activeSources.get(name)
      source?.stop()
      activeSources.delete(name)
    },

    stop: release,

    destroy: release,
  }
}

/**
 * Fetches and decodes one sound. A sound that is missing, or that the browser
 * cannot decode, is reported and skipped: losing one effect is not worth refusing
 * to start.
 */
async function load(context, cache, name, url) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Sound '${name}' could not be fetched from ${url}`)
      return
    }

    const audioBuffer = await context.decodeAudioData(
      await response.arrayBuffer(),
    )

    cache.set(name, audioBuffer)
  } catch (error) {
    console.warn(`Sound '${name}' could not be loaded from ${url}`, error)
  }
}
