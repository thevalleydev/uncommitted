/**
 * Composable for dark/light color mode with system preference detection
 * and localStorage persistence.
 */
export function useColorMode() {
  const colorMode = useState<'light' | 'dark'>('color-mode', () => 'light')

  function applyMode(mode: 'light' | 'dark') {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', mode === 'dark')
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
    } else {
      colorMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    applyMode(colorMode.value)

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('color-mode')) {
        colorMode.value = e.matches ? 'dark' : 'light'
        applyMode(colorMode.value)
      }
    })
  }

  return {
    colorMode: readonly(colorMode),
    toggle,
    init,
  }
}
