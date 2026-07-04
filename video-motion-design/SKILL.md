---
name: video-motion-design
description: Universal Chinese video production and motion-design workflow for Codex. Use when the user asks to turn a script, outline, narration, idea, explainer, course segment, short-video opening, transition, title card, full video scene, or Remotion/frontend animation into a polished reusable video artifact; especially when they mention Remotion, Lottie, frontend animation libraries, Chinese typography, visual style, export resolution/fps, or video rendering.
---

# Video Motion Design

## Core Intent

Create polished animated video scenes from scripts or ideas. Treat every request as a complete video-design task: clarify the message, shape the timing, build the visual system, implement the animation, verify frames, and give render commands.

Use Remotion by default when the project already uses it or when frame-accurate video export matters. Use another frontend animation stack only when the repository clearly uses it, the user asks for it, or Remotion would be unnecessarily heavy.

For detailed standards, read [references/motion-video-standards.md](references/motion-video-standards.md) before implementing substantial scenes or full videos.

## Workflow

1. Read the existing project structure before editing. Prefer existing Remotion compositions, assets, fonts, CSS, and component patterns.
2. Convert the user's script into beat-level video timing. Preserve the user's voice, but tighten text for on-screen readability.
3. Design the motion system before coding: scene list, duration, visual metaphor, typography, palette, assets, transitions, and expected render settings.
4. Implement in the smallest appropriate surface:
   - Existing Remotion composition for video work.
   - New Remotion composition when the scene is conceptually separate.
   - Existing frontend component only when the video is meant to be screen-recorded or embedded.
5. Use real visual assets when helpful: local assets first, then Lottie JSON, public media, generated bitmap images, or simple code-native graphics. Avoid pure decorative gradients and generic tech clutter.
6. Validate with commands and rendered stills:
   - Typecheck/lint if available.
   - Render stills at representative frames.
   - Inspect screenshots for text overflow, overlap, blank frames, asset failures, and style mismatch.
7. Provide exact preview and render commands, including output path, fps, resolution, codec, and quality options.

## Script To Screen

When the user gives narration, split it into 4-8 beats for short segments and more beats for full videos. Each beat should have:

- The narration or condensed on-screen line.
- The visual action.
- The dominant object or metaphor.
- The transition into the next beat.
- Timing in seconds or frames.

Keep on-screen text shorter than narration. Use large text only for key hooks, thesis lines, contrast pairs, and final takeaways. Put supporting explanations into smaller captions, cards, diagrams, or motion labels.

## Visual Style Defaults

Default style for Chinese educational/explainer videos:

- Warm paper, editorial, map, notebook, gallery, or clean studio feel.
- Sophisticated but approachable motion.
- Controlled palette with off-white, ink, sage/green, muted blue, amber, and one accent color.
- Minimal glow and restrained shadows.
- Avoid excessive cyber, neon, HUD, glassmorphism, emoji-heavy visuals, and generic "tech" grids unless the user asks for that tone.

Typography defaults:

- Chinese serif: `Source Han Serif CN SemiBold`, `Source Han Serif CN`, `Source Han Serif SC`, `Noto Serif SC`, `SimSun`, serif.
- Monospace: `JetBrains Mono`, `Cascadia Mono`, `Consolas`, monospace.
- Do not scale font size with viewport width.
- Use 0 letter spacing for Chinese display text unless a local design system already differs.

## Remotion Implementation Rules

- Keep composition metadata in `Root.tsx`: `id`, `durationInFrames`, `fps`, `width`, `height`.
- If changing fps while preserving duration, scale `durationInFrames` proportionally.
- Use `useCurrentFrame`, `useVideoConfig`, `interpolate`, `spring`, and `Easing` for deterministic animation.
- Avoid CSS animations for rendered video unless they are already stable in the project; Remotion may warn about non-frame-pure animation.
- Use `staticFile()` and `delayRender()` / `continueRender()` for Lottie or fetched local assets.
- Prefer fixed dimensions, aspect ratios, and constrained text boxes to prevent layout shifts.
- Build reusable small components for repeated cards, labels, diagrams, lower thirds, title cards, and Lottie players.

## Render And Preview

Preview:

```powershell
npm.cmd run dev -- --port 3000
```

Render:

```powershell
npm.cmd exec remotion render src\index.ts <CompositionId> out\<name>.mp4 --codec=h264 --crf=18
```

Temporary render overrides:

```powershell
npm.cmd exec remotion render src\index.ts <CompositionId> out\<name>_4k60.mp4 --width=3840 --height=2160 --fps=60 --codec=h264 --crf=18
```

Prefer changing the composition itself for durable fps/resolution changes. Use CLI overrides for one-off exports.

## Quality Checklist

Before finishing, verify:

- The video has a clear hook, development, and payoff.
- Every scene has a visual reason to exist.
- Text fits and does not overlap at target resolution.
- Visual assets load correctly.
- Motion is smooth and not visually noisy.
- The palette is not one-note and does not default to generic dark tech styling.
- Render commands are correct for Windows PowerShell; use `npm.cmd` when PowerShell blocks `npm.ps1`.
- Any warnings are explained, especially if they come from unrelated existing files.
