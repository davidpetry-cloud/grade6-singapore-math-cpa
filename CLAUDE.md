# Grade 6 Singapore Math (CPA) — project rules

Read this before touching anything. It is the contract, not a summary.

## What this is

A full-year Grade 6 mathematics curriculum built on the Singapore Math CPA
(Concrete → Pictorial → Abstract) approach. Ten units, 36 weeks, full daily
lesson plans. Flat folder, no build step, no server — the HTML files open
straight from disk.

## Layout

```
singapore-math-6-hub.html    year overview, pacing bar, unit index — SOURCE OF TRUTH
curriculum.css               all styling: tokens, layout, tool styles
curriculum-core.js           lesson renderer + 7 shared manipulatives
unit-template.html           start here for a new unit
test-unit.js                 jsdom harness, parameterised by filename
MANIFEST.md                  checksums + unit status snapshot
unit-01-…html, unit-02-…html
```

Everything stays in one folder. Links and shared assets break otherwise.

## Building a new unit

1. Copy `unit-template.html` to `unit-NN-slug.html`.
2. Fill the header block: title, framing sentence, the four facts.
3. Set `window.UNIT` — number, minutes, day-to-tools map.
4. Write `window.LESSONS`, one object per instructional day.
5. Flip `ready:true` on the matching entry in the hub's `UNITS` array and
   confirm `file` matches the filename.
6. Run the test harness. Do not ship on a failure.
7. Regenerate `MANIFEST.md` checksums and bump the bundle version.

## Shared tools (in curriculum-core.js)

`placeValue` · `rounding` · `shift` · `stepper` · `power` · `barModel` ·
`factors`

## Unit-specific tools already built (in unit-02)

`fractionModel` · `fractionDivide` · `decimalGrid`

Reuse before rebuilding. If a third unit needs one of these, promote it into
`curriculum-core.js` rather than copying it a second time.

Add new ones via `window.__EXTRA_TOOLS__` / `window.__EXTRA_NAMES__`, declared
BEFORE the `curriculum-core.js` tag. Reuse the shared classes (`.tool`, `.ctl`,
`.btn`, `.stage-area`, `.out`, `.note`, `.picker`) so no new CSS is needed.

## Non-negotiables

- **CPA order holds.** Concrete means a physical object in a student's hands.
  If a stage can't be done with materials, it is not the concrete stage.
- **Every SVG gets a descriptive `aria-label`** carrying the same information
  as the drawing, matching the lesson's "say the picture aloud" script.
- **Reduced motion is respected.** Check
  `window.matchMedia("(prefers-reduced-motion: reduce)").matches` before
  animating.
- **Colour is never the only cue.** Pair it with labels, patterns, or length.
  Guide lines drawn over mixed backgrounds must pick their stroke by what they
  sit on — a white line vanishes on unshaded paper. This has bitten us once.
- **Access notes are per-lesson**, naming the channel (touch, vision, hearing,
  language, attention, motor, memory). Never a boilerplate paragraph.
- **Mastery criteria are specific.** `crit` names the signal that triggers
  reteaching, not just a score.
- **A wrong answer inside a teaching tool is worse than no tool.** Every
  computed result a tool displays must be asserted in the test harness.

## Voice

Teacherly and specific. Scripts read like a person talking, not a lesson-plan
template. Warm-ups surface a misconception rather than rehearse a skill.
`watch` names the actual error and what to do about it. No filler, no
"students will enjoy" padding. Reasoning questions ask for explanation, not
another calculation.

## Testing

```
npm install jsdom      # once
node test-unit.js unit-03-ratio-and-rate.html
```

Adapts to lesson count. Checks structural completeness of every lesson, CPA
stage order, stage timings against lesson length, that a tool mounts on every
day, and that every mounted SVG carries a descriptive aria-label.

Add assertions for any new tool's arithmetic before shipping it.

## Model guidance

Units needing a genuinely new pedagogical visual are worth Opus. Units reusing
existing tools are template work; Sonnet handles them well.

| unit | topic | model |
|---|---|---|
| 03 | Ratio & Rate | Sonnet — reuses barModel |
| 04 | Percentage | Sonnet — reuses barModel, decimalGrid |
| 05 | Algebraic Expressions & Equations | **Opus** — needs an unknowns visual |
| 06 | Angles & Geometric Figures | Sonnet |
| 07 | Circles | Sonnet — deriving π is reachable with existing tools |
| 08 | Volume of Solids | Sonnet — reuses power blocks |
| 09 | Data Analysis & Statistics | **Opus** — needs a distribution builder |
| 10 | Negative Numbers & Coordinate Plane | Sonnet |

One unit per session. Unit files are large and carrying two degrades output
before the second is finished.

## Commits

One commit per unit, message `unit NN: <topic>`. Tool fixes and content edits
get their own commits so `git log --oneline` stays readable as a build history.
