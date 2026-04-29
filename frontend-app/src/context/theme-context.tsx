import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderContextType = {
    theme: Theme
    applyTheme: (theme: Theme) => void

}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    ...props
}: {
    children: React.ReactNode
    defaultTheme?: Theme
}) {

    const [theme, setTheme] = useState<Theme>(defaultTheme)
    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement
        root.classList.remove("light", "dark")
        if (newTheme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            root.classList.add(systemTheme)
        } else {
            root.classList.add(newTheme)
        }
        localStorage.setItem("theme", newTheme)
        setTheme(newTheme)
    }

    useEffect(() => {
      const storedTheme = localStorage.getItem("theme") as Theme;
      applyTheme(storedTheme || defaultTheme); // ← si no hay guardado, usa el default
    }, [defaultTheme]);

    const value = {
        theme,
        applyTheme,
        
    }
    return (
        <ThemeProviderContext.Provider value={value} {...props}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
    return context
}
