---
name: ClaudeSeedanceSkill
description: Use when crafting video generation prompts, image-to-video instructions, or multishot storyboards for the ByteDance Seedance video model.
---

# Claude Seedance Skill (ByteDance Seedance Video Prompting)

This skill provides prompting structures, motion consistency templates, and scene composition rules optimized for the ByteDance Seedance multimodal video generator.

## Key Prompt Rules for Seedance
1. **Multishot Consistency**:
   - Keep the subject description identical across scenes (e.g., "A 25-year-old student, wearing a dark blue hoodie, short dark hair").
2. **Action Precision**:
   - Seedance excels at physical interactions. Frame prompts clearly: "typing on a retro mechanical keyboard, keys compressing, fingers moving fluidly."
3. **Model Strengths**:
   - Focus prompts on high-fidelity features: realistic skin textures, lighting reflections, detailed fabric simulations.
   - Example prompt suffix: `8k resolution, photorealistic, cinematic grade, highly detailed render, steady cam, 24fps.`
4. **I2V (Image to Video) Motion Guidance**:
   - Instruct the model on what elements to animate in the static image: "The camera pushes in slowly; the dust particles float in the sunbeams; the student's eyes blink once."
