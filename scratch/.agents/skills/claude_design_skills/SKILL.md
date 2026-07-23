---
name: ClaudeDesignSkills
description: Use when generating modern, beautiful, and premium web user interfaces (UI) and design systems.
---

# Claude Design Skills (AI UI Generation)

This skill guides the design of modern, visual-first, premium user interfaces. Use it to ensure all web applications present a stunning visual identity.

## Design Principles
1. **Glassmorphism & Depth**:
   - Use semi-transparent backdrops (`background: rgba(255, 255, 255, 0.03)`).
   - Apply backdrop blurs (`backdrop-filter: blur(12px)`).
   - Use clean, thin borders (`border: 1px solid rgba(255, 255, 255, 0.08)`).
2. **Color Palette Hierarchy**:
   - Avoid standard primary colors. Use custom premium palettes:
     - Saffron: `rgb(255, 107, 26)` (Dark mode accent).
     - Teal: `rgb(0, 212, 184)`.
     - Dark BG: `#020408` or HSL equivalents.
   - Use subtle gradients for titles and icons instead of flat colors.
3. **Premium Typography**:
   - Import Google Fonts (e.g., `Inter`, `Outfit`, `Playfair Display`).
   - Establish a clear hierarchy: large display fonts for headers, monospace for stats, clean sans-serif for body copy.
4. **Layout Grid**:
   - Use flexible CSS grid and flexbox wrappers with standard gap spacing tokens:
     - `--space-sm`: `8px`
     - `--space-md`: `16px`
     - `--space-lg`: `24px`
     - `--space-xl`: `32px`
     - `--space-2xl`: `48px`
