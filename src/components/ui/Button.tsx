import * as React from "react"
import { motion } from "framer-motion"
import { useMotionValue, useSpring } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof motion.button> {
    variant?: "default" | "destructive" | "outline" | "ghost" | "gold"
    size?: "default" | "sm" | "lg" | "icon"
    magnetic?: boolean
}

export const Button = React.forwardRef<React.ElementRef<typeof motion.button>, ButtonProps>(
    ({ className, variant = "default", size = "default", magnetic = true, children, onMouseMove, onMouseLeave, ...props }, ref) => {
        const x = useMotionValue(0)
        const y = useMotionValue(0)

        const mouseXSpring = useSpring(x)
        const mouseYSpring = useSpring(y)

        const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (!magnetic) return
            const rect = e.currentTarget.getBoundingClientRect()
            const width = rect.width
            const height = rect.height
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top
            const xPct = mouseX / width - 0.5
            const yPct = mouseY / height - 0.5
            x.set(xPct * 15) // max 15px shift
            y.set(yPct * 15) // max 15px shift
            if (onMouseMove) {
                // Safe cast to pass it along if defined by user
                onMouseMove(e as any)
            }
        }

        const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (!magnetic) return
            x.set(0)
            y.set(0)
            if (onMouseLeave) {
                onMouseLeave(e as any)
            }
        }

        const baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden"

        const variants = {
            default: "bg-[var(--gradient-brand)] text-white shadow-glow-emerald border border-emerald-500/20 hover:brightness-110",
            destructive: "bg-[var(--gradient-error)] text-white shadow-glow-crimson border border-rose-500/20 hover:brightness-110",
            outline: "border border-[var(--border-glass-bright)] bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] hover:border-[var(--text-gold)] text-[var(--text-primary)] hover:text-[var(--text-gold)] transition-all",
            ghost: "hover:bg-[var(--color-emerald-bg)] hover:text-emerald-500 text-[var(--text-secondary)]",
            gold: "bg-[var(--text-gold)] text-amber-950 hover:bg-amber-400 shadow-glow-gold font-semibold border border-amber-300/50"
        }

        const sizes = {
            default: "h-11 px-6 py-2",
            sm: "h-9 rounded-md px-4",
            lg: "h-14 rounded-xl px-8 text-base",
            icon: "h-11 w-11"
        }

        const compClass = cn(baseClass, variants[variant], sizes[size], className)

        return (
            <motion.button
                ref={ref}
                className={compClass}
                onMouseMove={handleMouseMove as any}
                onMouseLeave={handleMouseLeave as any}
                style={magnetic ? { x: mouseXSpring, y: mouseYSpring } : undefined}
                whileTap={magnetic ? { scale: 0.96 } : {}}
                {...props}
            >
                <span className="relative z-10 flex items-center gap-2">{children as React.ReactNode}</span>
                {variant === 'default' && (
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                )}
            </motion.button>
        )
    }
)
Button.displayName = "Button"
