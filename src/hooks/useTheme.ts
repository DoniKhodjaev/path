import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useTheme() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (mode: 'light' | 'dark') => {
      root.classList.remove('light', 'dark')
      root.classList.add(mode)
      root.style.colorScheme = mode

      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) {
        meta.setAttribute('content', mode === 'dark' ? '#0a0f1e' : '#faf6ed')
      }
    }

    if (theme === 'auto') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mql.matches ? 'dark' : 'light')

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    } else {
      applyTheme(theme)
    }
  }, [theme])
}
