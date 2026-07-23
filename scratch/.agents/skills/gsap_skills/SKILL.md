---
name: GSAPSkills
description: Use when building high-performance animations, scroll-triggered movements, timeline sequences, or page transitions with GSAP (GreenSock Animation Platform).
---

# GSAP Skills (GSAP Animations)

This skill outlines the integration of GSAP (GreenSock Animation Platform) for high-performance animations, timeline sequences, and ScrollTrigger events.

## Best Practices
1. **Performance First**:
   - Utilize GPU-accelerated properties: `x`, `y`, `scale`, `rotation`, and `opacity`.
   - Avoid animating layout-triggering properties like `top`, `left`, `margin`, or `width` (use `x` and `scaleX` instead).
   - Apply `force3D: true` to layers to trigger hardware acceleration.
2. **ScrollTrigger Controls**:
   - Define triggers cleanly: `trigger: ".trigger-element"`.
   - Set `start` and `end` offsets explicitly (e.g., `start: "top 80%"`).
   - Use `scrub: true` or `scrub: 1` (adds a 1-second delay for buttery smooth catch-up) for scroll-bound animations.
3. **Timeline Sequencing**:
   - Create timelines using `gsap.timeline({ defaults: { ease: "power2.out", duration: 0.8 } })`.
   - Chain animations and use relative offsets (e.g., `"-=0.4"`) to stagger animations smoothly.
4. **Clean up**:
   - When building dynamic websites, kill active triggers and animations on page transitions or unmount to avoid memory leaks: `ScrollTrigger.getAll().forEach(t => t.kill());`.
