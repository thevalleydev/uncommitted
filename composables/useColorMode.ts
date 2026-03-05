/**
 * Composable for dark/light color mode with system preference detection
 * and localStorage persistence.
 */
export function useColorMode() {
  const colorMode = useState<'light' | 'dark'>('color-mode', () => 'light')

  /** Apply a mode to the DOM only — does not persist to localStorage. */
  function applyDOM(mode: 'light' | 'dark') {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }

  /** Apply a mode to the DOM and persist the explicit user preference. */
  function applyMode(mode: 'light' | 'dark') {
    if (import.meta.client) {
      applyDOM(mode)
      localStorage.setItem('color-mode', mode)
    }
  }

  function toggle() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
    applyMode(colorMode.value)
  }

  function init() {
    if (!import.meta.client) return

    const stored = localStorage.getItem('color-mode') as 'light' | 'dark' | null
    if (stored) {
      colorMode.value = stored
      applyMode(colorMode.value)
    } else {
      // No stored preference: follow system and apply to DOM only (do not persist)
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      colorMode.value = systemDark ? 'dark' : 'light'
      applyDOM(colorMode.value)
    }

    // Respond to system preference changes when no explicit preference is stored
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('color-mode')) {
        colorMode.value = e.matches ? 'dark' : 'light'
        applyDOM(colorMode.value)
      }
    })
  }

  return {
    colorMode: readonly(colorMode),
    toggle,
    init,
  }
}
