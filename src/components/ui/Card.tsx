import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "./Button" // Reusing cn utility if I put it in Button, or I should create a lib/utils.ts.

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "glass" | "solid" | "elevated"
    interactive?: boolean
    withMotifs?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "glass", interactive = false, withMotifs = false, children, ...props }, ref) => {

        const baseClass = "rounded-2xl overflow-hidden relative"

        const variants = {
            glass: "glass border-arabesque shadow-lg",
            solid: "bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md",
            elevated: "bg-[var(--bg-elevated)] border border-[var(--border-glass-bright)] shadow-xl"
        }

        const interactiveClass = interactive ? "transition-all duration-300 hover:shadow-glow-emerald hover:-translate-y-1 cursor-pointer" : ""

        const motifClass = withMotifs ? "bg-mashrabiya bg-opacity-20" : ""

        return (
            <div
                ref={ref}
                className={cn(baseClass, variants[variant], interactiveClass, motifClass, className)}
                {...props}
            >
                {withMotifs && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-moroccan opacity-80" />
                )}
                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </div>
        )
    }
)
Card.displayName = "Card"

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-2xl font-bold leading-none tracking-tight heading-decorative text-[var(--text-gold)]", className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-sm text-[var(--text-muted)]", className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-6 pt-0", className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
}
