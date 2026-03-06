import * as React from "react"
import { cn } from "./Button" // assuming cn is exported from Button or utils

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, icon, ...props }, ref) => {

        const baseClass = "flex h-12 w-full rounded-xl border bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-primary)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"

        // Emerald default focus, Crimson on error
        const stateClass = error
            ? "border-rose-500/50 focus-visible:border-rose-500 focus-visible:ring-1 focus-visible:ring-rose-500 shadow-glow-rose"
            : "border-[var(--border-glass)] hover:border-[var(--text-gold)]/50 focus-visible:border-[var(--color-emerald)] focus-visible:ring-1 focus-visible:ring-[var(--color-emerald)] focus-visible:shadow-glow-emerald"

        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-1">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(baseClass, stateClass, icon ? "pl-11" : "", className)}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
Input.displayName = "Input"
