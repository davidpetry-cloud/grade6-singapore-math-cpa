# 3D tools: design standard

How this curriculum builds manipulatives in real 3D. Started 2026-10-16 with
Unit 8's fold preview. Grow this file as tools are added: new patterns go in the
standard, settled questions go in the decision log, and the next ideas go in the
roadmap.

## When real 3D is allowed

David's design rule is "depth by illusion, never real 3D" (light, shade and
shadow; nothing rotates, tilts or warps text). **One exception, decided by David
on 2026-10-16:** real 3D is allowed *inside a geometry tool*, when the solid is
what's being taught: a net folding into a cube, unit cubes filling a prism. Even
there:

- **Text never sits on a 3D surface.** Labels are flat HTML laid over the canvas,
  so they never skew or warp.
- **The page itself keeps depth by illusion.** No 3D headers, cards or transitions.
- **3D is the pictorial stage, never the concrete one.** "Nets must be physically
  folded" (project rules). Every 3D tool tells students to do it with paper first.

If a tool would work as well in flat SVG, use flat SVG.

## Stack

- **Three.js**, a dev dependency (`npm install`), bundled by **esbuild** into one
  ordinary script per tool, committed to the repo. Three.js ships only as a
  JavaScript module, and browsers block modules on pages opened from disk; a
  classic-script bundle keeps the "open straight from disk" rule.
- **Nothing loads from another site.** No CDN copies of Three.js, no fonts or
  textures from elsewhere. Textures (hatching and so on) are drawn on a canvas
  in code.
- Only the pages that use a 3D tool load its bundle, with `defer`, and the tool
  reads it lazily. Other units pay nothing.
- Rebuild with `npm run build:3d`. The bundle carries the Three.js MIT licence.

## File pattern

For a tool called `example`:

| File | Job |
|---|---|
| `example-geometry.js` | Pure maths: positions, rotations, which face lands where. No Three.js, no DOM. A classic script that also works with `require()`, so Node tests can use it |
| `src/example-3d.js` | The 3D view: Three.js scene, camera, lights, controls, labels. Reads the geometry module; does no maths of its own |
| `example-3d.js` | The esbuild output. Never edit by hand |
| `example.js` | The tool itself (the `__EXTRA_TOOLS__` entry): flat controls, messages, and mounting the 3D view |
| `example.test.js`, `example-geometry.test.js` | jsdom tests of the tool; Node tests of the geometry |

**One source of truth.** The 3D view places every mesh from the matrices the
geometry module computes (`matrixAutoUpdate = false`), so what the tests assert
is exactly what students see. "A wrong answer inside a teaching tool is worse
than no tool": every number or face name a 3D tool shows is asserted in a test.

## Access (WCAG 2.2 AA, plus the project's rules)

- **The flat tool does the job on its own.** The 3D view adds to it; without
  WebGL (or in the jsdom tests) the tool still works and says the 3D view is
  unavailable.
- **The canvas is described.** Its wrapper has `role="img"` and an `aria-label`
  carrying the same information as the picture (how far folded, which faces meet,
  what's left open), updated as it changes. Results also appear as text.
- **No drag-only controls** (WCAG 2.5.7). Turning the view has buttons and arrow
  keys as well as dragging. Folding has a slider and buttons.
- **Keyboard everywhere**, with the visible focus ring; targets 44px by default,
  never under 28px (Apple's Human Interface Guidelines, as on the rest of the site).
- **Colour is never the only cue.** A problem face gets a pattern (hatching), a
  number, and a sentence naming it, as well as a colour. No pinks; terracotta
  marks a problem.
- **Contrast** 4.5:1 for every label, 3:1 for edges that carry meaning.

## Motion

- Students drive it: the slider, the buttons, dragging. A single animation may
  run when a student presses a button (for example, Fold it); nothing spins or
  loops on its own.
- With reduced motion on, presses jump straight to the end state; the slider
  still works, because it is the student's own movement.
- Render only when something changes; no constant animation loop, which
  saves phone batteries.

## Look

- Light and shade give depth (a hemisphere light plus one directional light);
  edges are drawn as dark outlines so shapes read in greyscale too.
- Colours come from the curriculum's tokens; for the redesign, the unit's domain
  family (geometry is greens).

## Decision log

| Date | Decision | By |
|---|---|---|
| 2026-10-16 | Real 3D allowed inside geometry tools only; labels stay flat HTML | David |
| 2026-10-16 | First 3D tool: Unit 8's fold preview, added to netFold (days 7–14) | David |
| 2026-10-16 | netFold's access problems fixed in the same change: keyboard placement, non-colour clash cue, label contrast, the font it named | David |
| 2026-10-16 | Three.js 0.186, bundled with esbuild into a committed classic script | Claude, from the open-from-disk rule |
| 2026-10-16 | Pressing Fold it plays the fold once (a student action); the slider then lets them scrub it. Reduced motion jumps to folded | Claude |
| 2026-10-16 | netFold's grid became 40 real buttons with roving focus (one Tab stop, arrow keys, Home, End), replacing clickable SVG squares | Claude |
| 2026-10-16 | Unit 8 loads `net-fold.js` as a file instead of an inline copy, so the tested file is the shipped file | Claude |

## Roadmap

1. **Fold preview** (Unit 8, days 7–14): built 2026-10-16 (`net-fold-geometry.js`,
   `src/net-fold-3d.js`, `net-fold.js`). Bundle 533 KB, 138 KB compressed.
2. **Unit-cube prism builder** (Unit 8, days 1–6): length × width × height filled
   layer by layer, including half and quarter cubes for fractional edges.
3. **Surface area unfolding** (Unit 8, days 10–12): run the fold preview in
   reverse on a rectangular prism, with each face's area labelled.
4. Later candidates, each to be checked against "would flat SVG do?": circle
   wedges rearranging (Unit 7) and the coordinate plane (Unit 10) probably stay
   flat.

Move each one through the same pattern, add its decisions to the log, and add
any new pattern to the standard above.
