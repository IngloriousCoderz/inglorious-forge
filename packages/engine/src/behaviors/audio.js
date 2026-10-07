const DEFAULT_VOLUME = 1

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

export function audio() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  const audioBufferCache = new Map()
  const activeSources = new Map()

  function resume() {
    window.removeEventListener("pointerdown", resume)
    window.removeEventListener("keydown", resume)
    audioContext.resume()
  }

  // Both stopping the game and being taken off the world have to let go of the window and
  // of anything still sounding over it. One function, because the two differ only in when
  // they happen -- and a listener an entity that is no longer in the world forgot to take
  // off would stay on the page for as long as the page is open.
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
          load(audioContext, audioBufferCache, name, url),
        ),
      )
    },

    soundPlay(entity, name) {
      const { volume = DEFAULT_VOLUME, loop } = entity.sounds[name] || {}
      const audioBuffer = audioBufferCache.get(name)

      if (!audioBuffer) return

      // Only one source per sound can be tracked, so playing a sound again
      // replaces the previous one instead of stacking a new copy on top of it.
      activeSources.get(name)?.stop()

      const source = audioContext.createBufferSource()
      const gainNode = audioContext.createGain()

      source.buffer = audioBuffer
      gainNode.gain.value = volume

      source.connect(gainNode)
      gainNode.connect(audioContext.destination)

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

    // Taken off the world rather than the game stopping: the same letting go, because
    // there is nothing left for anything still sounding to be sound over.
    destroy: release,
  }
}
