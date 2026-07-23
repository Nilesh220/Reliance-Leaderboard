---
name: MotionDevAnimationsSkill
description: Use when designing CSS animations, micro-animations, keyframe layouts, hover effects, or using the Motion Dev library (Motion One / Motion) for animations.
---

# Motion Dev Animations Skill (Micro-Animations & CSS Transitions)

This skill focuses on designing elegant keyframe animations, interactive hover states, micro-animations, and high-performance physics-based motion.

## Motion Design Rules
1. **Buttery Micro-Animations**:
   - Apply hover states to all cards, links, and buttons.
   - Use transition timing functions: `cubic-bezier(0.16, 1, 0.3, 1)` (custom ease-out) or spring properties.
   - Hover effects should be responsive: scale up `1.02x` or `1.05x`, and translate slightly upwards (`translateY(-4px)`).
2. **Keyframe Entries**:
   - Utilize a visual reveal system for sections when scrolled into view.
   - Apply CSS variables to delay nested items (e.g., `--reveal-delay: 1`, `--reveal-delay: 2`).
3. **Physics & Spring Settings**:
   - When scripting spring-based animations, target a bounce of `0.2` to `0.3` to avoid jiggliness.
   - Limit animation distance: objects should move between `10px` and `30px` maximum. Long-range movements look cheap.
