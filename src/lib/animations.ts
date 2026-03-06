import { Variants } from "framer-motion"

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
}

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
}

export const zelligeReveal: Variants = {
    hidden: { opacity: 0, clipPath: "circle(0% at 50% 50%)" },
    visible: {
        opacity: 1,
        clipPath: "circle(150% at 50% 50%)",
        transition: { duration: 0.8, ease: "easeOut" }
    }
}

export const magneticHover = {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 }
}

export const hoverGlow = {
    boxShadow: "0px 0px 20px rgba(16, 185, 129, 0.4)", // emerald glow
    transition: { duration: 0.3 }
}
