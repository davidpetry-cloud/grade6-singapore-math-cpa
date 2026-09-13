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

## Unit-specific tools already built

In `curriculum-core.js` (promoted when a second unit reused them):
`decimalGrid` · `rateLine`

Still unit-local: `balanceScale` in unit-05 (also shipped as `balance-scale.js`); `angleChase` in unit-06 (also shipped as `angle-chase.js`); `circleUnroll` and `circleWedges` in unit-07 (also shipped as `circle-tools.js`); `netFold` in unit-08 (also shipped as `net-fold.js`); `distBuilder` in unit-09 (also shipped as `dist-builder.js`); `coordPlane` in unit-10 (also shipped as `coord-plane.js`)

Still unit-local, in unit-02: `fractionModel` · `fractionDivide`

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

## Per-unit scope

The hub's `UNITS` array owns title, days, weeks, standards, filename and colour
— read it, don't duplicate it here. What follows is the pedagogical scope that
the hub doesn't carry: how to split the days, which tools apply, what the
concrete stage uses, and which contexts to lean on.

Treat the day splits as a starting proposal, not a mandate. If a strand needs
an extra day, take it from review — but never from the concrete stage.

### Unit 3 — Ratio & Rate (15 days)

- Days 1–4 ratio language, part-part vs part-whole, notation, simplest form
- Days 5–8 equivalent ratios and ratio tables, scaling up and down
- Days 9–12 rate, unit rate, better-buy comparison, speed
- Days 13–14 comparison bar models for two- and three-term ratio problems
- Day 15 review stations and assessment

Tools: `rateLine` (built, in `rate-line.js` — inline it via `__EXTRA_TOOLS__`),
plus `barModel` comparison mode.
Concrete: two-colour counters or linking cubes grouped into equal sets;
measuring cups for the mixing contexts.
Contexts: recipes, unit price, speed, paint mixing.
**6.RP.A.3a is in scope** — ratio tables belong here, not in Unit 4. Percent
(6.RP.A.3c) is explicitly Unit 4; do not pull it forward.

### Unit 4 — Percentage (15 days)

- Days 1–3 percent as a rate per hundred, built on Unit 2's hundredths grid
- Days 4–6 converting percent, fraction and decimal
- Days 7–9 finding a percent of a quantity
- Days 10–11 finding the whole given a part
- Days 12–14 percent increase and decrease, discount, tax, tip
- Day 15 review and assessment

Tools: `decimalGrid` and `rateLine` (both second use — promote to core here),
plus `barModel`.
Concrete: hundredths grids, hundred-bead strings, price tags.
Contexts: discounts, tips, test scores, population change.
Percent is a rate per hundred — say so and reuse Unit 3's line rather than
teaching it as a fresh idea.

### Unit 5 — Algebra (20 days) — Opus

- Days 1–3 letters as unknowns, writing expressions from words
- Days 4–6 evaluating by substitution
- Days 7–9 equivalent expressions, distributive property, collecting like terms
- Days 10–13 one-step equations across all four operations
- Days 14–16 inequalities and solution sets on a number line
- Days 17–19 word problems to equations via bar model
- Day 20 review and assessment

New tool needed: a balance model — an equation as a pan balance where the same
operation must be applied to both sides, and the balance visibly tips when it
isn't. This is the unit's central image; budget design time for it.
Concrete: pan balance, cups-and-counters (cup = the unknown), algebra tiles.
Contexts: age puzzles, perimeter, cost totals.

### Unit 6 — Angles & Geometric Figures (13 days) — resolved Sep 2026

The 6.G.A.3 coordinate-plane strand moved to Unit 10, which grew from 10 to 13
days to absorb it. Unit 6 now covers angle and area reasoning only.

- Days 1–3 angles on a line and at a point, vertically opposite
- Days 4–6 triangle angle sum, triangle types
- Days 7–9 quadrilateral angle sum; parallelogram, trapezoid, rhombus properties
- Days 10–12 area of triangles and parallelograms by decomposition
- Day 13 review and assessment

New tool: `angleChase` — reveals one reasoning step at a time, in the shape of
`stepper` (Unit 1). Each step names the rule that justifies it (angles on a
line, vertically opposite, triangle sum, quadrilateral sum) rather than just
producing the missing angle.
Concrete: protractors, torn-triangle angle sum (tear the corners, line them
up), geoboards.

### Unit 7 — Circles (15 days) — Opus

- Days 1–3 centre, radius, diameter, naming and notation
- Days 4–6 deriving π by measuring real circles
- Days 7–9 circumference problems
- Days 10–12 area of a circle by wedge rearrangement
- Days 13–14 composite figures, semicircle perimeter
- Day 15 review and assessment

**Corrected from the earlier model table, which said Sonnet.** Two genuinely
new visuals are needed: unrolling a circumference against its diameter to show
π, and cutting a circle into wedges that rearrange into a near-parallelogram to
derive the area. Neither is reachable with existing tools.
Concrete: circular lids and tins, string, measuring tape, paper circles to cut.
The measuring must be real — a table of hand-measured C and d, with the scatter
in the results discussed rather than tidied away, is the whole point of days 4–6.

### Unit 8 — Volume of Solids (15 days)

- Days 1–3 volume by counting unit cubes, then the formula
- Days 4–6 fractional edge lengths (leans on Unit 2)
- Days 7–9 nets and how they fold
- Days 10–12 surface area from nets
- Days 13–14 capacity and real containers
- Day 15 review and assessment

Tools: `power` for the cube-building. **Decide at the start** whether nets need
a fold-preview tool; if yes, that upgrades this unit to Opus.
Concrete: unit cubes, nets printed to cut and fold, measuring jugs and boxes.
Nets must be physically folded. A net that is only ever a picture defeats the
concrete stage.

### Unit 9 — Data Analysis & Statistics (15 days) — Opus

- Days 1–3 statistical questions and what makes a question statistical
- Days 4–6 dot plots
- Days 7–9 histograms and the effect of bin width
- Days 10–12 mean, median, mode
- Days 13–14 spread, and choosing a measure that fits the shape
- Day 15 review and assessment

New tool needed: a distribution builder — add or drag data points and watch the
dot plot, histogram and summary measures update together. Changing bin width
must visibly change the story the histogram tells; that is the lesson of days
7–9 and it cannot be made with a static image.
Concrete: sticky notes or cubes built into a physical dot plot on the wall,
using data the class generates about itself.

### Unit 10 — Negative Numbers & the Coordinate Plane (13 days) — grown Sep 2026

Absorbed the 6.G.A.3 strand from Unit 6 (see that section) — polygons on the
coordinate plane, so it can build on both integers and geometry in one pass.

- Days 1–2 integers in context: temperature, elevation, balance
- Days 3–4 the number line, ordering and comparing
- Days 5–6 absolute value as distance from zero
- Days 7–8 the coordinate plane, all four quadrants
- Day 9 distance between points, reflections across an axis
- Days 10–11 polygons on the coordinate plane: plotting vertices, finding side
  lengths and areas from coordinates
- Day 12 composite problems mixing integers, distance and polygon area
- Day 13 review and assessment

New tool likely: an interactive coordinate plane for plotting, reflecting,
measuring distance, and outlining a polygon from its vertices.
Concrete: a floor-taped number line students walk along, thermometers, a
floor-sized coordinate grid.

## Tool promotion rule

A unit-specific tool used by a second unit gets promoted into
`curriculum-core.js` rather than copied. `decimalGrid` and `rateLine` were
promoted when Unit 4 reused them; they live in the `__PROMOTED__` IIFE near the
bottom of the core, kept in their own scope so their helpers cannot collide
with the core's. Promote `fractionModel` when any later unit reuses it.

Promoting has a side effect worth knowing: `UNIT.tools` set to `"all"` used to
mount every tool in the registry, which meant Unit 1's review day started
offering a rate line. The core now resolves `"all"` to the union of the tools
that unit's own day map lists, so a review station never offers a tool from a
later unit. If a review day mounts nothing, check the day map is populated.

## Model guidance

Units needing a genuinely new pedagogical visual are worth Opus. Units reusing
existing tools are template work; Sonnet handles them well.

| unit | model | why |
|---|---|---|
| 03 | done | built in chat |
| 04 | done | built in chat |
| 05 | done | built in chat |
| 06 | done | built in chat |
| 07 | done | built in chat |
| 08 | done | built in chat on Opus; nets did need a fold tool |
| 09 | done | tool built on Opus, lessons written on Sonnet |
| 10 | done | built in chat |

Design a new tool in chat on Opus, test it, then let Sonnet write the lessons
against the finished tool. That split has worked twice now.

One unit per session. Unit files are large and carrying two degrades output
before the second is finished.

## Commits

One commit per unit, message `unit NN: <topic>`. Tool fixes and content edits
get their own commits so `git log --oneline` stays readable as a build history.


## Status: complete

All ten units built and tested — 148 instructional days, 259 test assertions, zero failures. `fractionModel` and `fractionDivide` (unit-02) remain the only tools never reused by a second unit, so they were never promoted into core; that's fine and matches the promotion rule as written.
