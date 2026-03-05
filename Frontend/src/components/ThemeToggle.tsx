import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch — only render after mount
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-full border-border bg-card hover:bg-secondary transition-colors"
            aria-label="Toggle dark mode"
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300" />
            ) : (
                <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300" />
            )}
        </Button>
    );
}
