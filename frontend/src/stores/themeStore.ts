import { create } from "zustand"

export type ColorMode = "light" | "dark"

interface ThemeState {
  mode: ColorMode
  setMode: (mode: ColorMode) => void
  toggleMode: () => void
}

const STORAGE_KEY = "careverse_regulator_color_mode"

function persistMode(mode: ColorMode): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Ignore storage errors and keep in-memory mode.
  }
}

function readInitialMode(): ColorMode {
  if (typeof window === "undefined") return "light"

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch {
    // Ignore storage errors and fallback to media preference.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: readInitialMode(),
  setMode: (mode: ColorMode) => {
    persistMode(mode)
    set({ mode })
  },
  toggleMode: () => {
    const nextMode: ColorMode = get().mode === "dark" ? "light" : "dark"
    persistMode(nextMode)
    set({ mode: nextMode })
  },
}))
