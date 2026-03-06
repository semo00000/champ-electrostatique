# Moroccan UI/UX Integration Guide

This guide explains how to apply the new Moroccan-inspired UI/UX system to existing components and pages in the application.

## 1. Global Motif Utilities

We have introduced CSS classes in `src/app/globals.css` that instantly apply Moroccan-inspired textures and borders. 
You can use these on any layout container, card, or modal.

- `bg-zellige`: Applies a subtle, geometrically repeating zellige tile watermark texture. Ideal for headers, footers, or hero sections.
- `bg-mashrabiya`: Applies a dotted/lattice texture reminiscent of traditional mashrabiya woodwork. Ideal for cards or sidebars.
- `border-arabesque`: Applies a stylized border with subtle corner ornaments in gold. Best used on elevated cards or prominent modals.

*Example Usage:*
```tsx
<div className="bg-[var(--bg-card)] border-arabesque bg-mashrabiya bg-opacity-10 p-6 rounded-2xl">
  <h2>My Content</h2>
</div>
```

## 2. Shared Core Components (`src/components/ui/`)

Instead of writing custom tailwind classes for standard interactive elements, use the pre-built, theme-aware core components:

### Button
The new `<Button>` component includes smooth Framer Motion magnetic hover effects and uses the deep emerald/crimson gradients.
```tsx
import { Button } from "@/components/ui/Button"

// Premium gradient button
<Button>Start Lesson</Button>

// Gold accent button
<Button variant="gold">Upgrade to Premium</Button>
```

### Card
The new `<Card>` component encapsulates the `border-arabesque` and `bg-mashrabiya` logic.
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"

<Card interactive withMotifs>
  <CardHeader>
    <CardTitle>Physics Lesson 1</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here.</p>
  </CardContent>
</Card>
```

### Input
The `<Input>` component is pre-configured with inner shadows and proper emerald focus rings.
```tsx
import { Input } from "@/components/ui/Input"
import { Search } from "lucide-react"

<Input placeholder="Search..." icon={<Search className="w-4 h-4" />} />
```

## 3. Typography & Gradients

- **Heading Font:** Use the `heading-decorative` class to enforce the new Moroccan display font (Amiri) for elegant chapter titles or lesson headers.
- **Gradient Text:** Use `gradient-text` for the vivid green-to-emerald brand text, or `gradient-text-moroccan` for the striking crimson-to-emerald transition.

## 4. Animations

Import shared Framer Motion variants from `src/lib/animations.ts` to ensure transitions across the website feel uniformly polished and deliberate:

```tsx
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations"

<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  <motion.div variants={fadeInUp}>Item 1</motion.div>
  <motion.div variants={fadeInUp}>Item 2</motion.div>
</motion.div>
```
