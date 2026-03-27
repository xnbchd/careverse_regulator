import { useEffect } from "react"
import { useThemeStore } from "@/stores/themeStore"

/**
 * Theme Bridge Hook
 * Synchronizes theme changes between Ant Design and shadcn/ui
 *
 * This hook ensures that when the theme mode changes:
 * 1. The `data-theme` attribute is set on the root element for CSS variables
 * 2. The `dark` class is toggled for shadcn components
 * 3. CSS variables in index.css are used as the single source of truth
 */
export function useThemeBridge() {
  const mode = useThemeStore((state) => state.mode)

  useEffect(() => {
    const root = document.documentElement

    // Set data-theme attribute for CSS variable switching
    root.setAttribute("data-theme", mode)

    // Toggle dark class for shadcn components
    if (mode === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [mode])
}
