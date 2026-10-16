# Grade 6 Singapore Math (CPA) — build guide

Everything lives in one flat folder. No build step, no server; open the HTML
files straight from disk. (The one built file, Unit 8's 3D bundle, is committed
ready to use; see "3D tools" below.)

Live site: https://davidpetry-cloud.github.io/grade6-singapore-math-cpa/

```
singapore-math-6-hub.html          year overview, pacing bar model, unit index
curriculum.css                     all styling — tokens (light and dark), layout, tool styles
curriculum-core.js                 lesson renderer + the shared interactive manipulatives
theme-toggle.js                    light/dark switch, remembered on the device
fonts/                             Lexend and Fraunces, self-hosted (no requests to Google)
unit-template.html                 start here for a new unit
unit-01-whole-numbers-and-operations.html
unit-02-… (etc.)
balance-scale.js, angle-chase.js … unit-specific tools, each with its own .test.js
src/net-fold-3d.js                 source of Unit 8's 3D fold preview (bundled to net-fold-3d.js)
docs/3d-tools.md                   design standard for 3D tools
```

Keep every file in the same folder or the links and shared assets break.

## Building a new unit

1. Copy `unit-template.html` to `unit-NN-slug.html`.
2. Fill in the header block (title, framing sentence, the four facts).
3. Set `window.UNIT` — number, minutes, and the day-to-tools map.
4. Write `window.LESSONS`, one object per instructional day.
5. Update the matching entry in the hub's `UNITS` array: set `ready:true` and
   check `file` matches your filename.

Nothing else needs touching. The renderer, day tabs, print styles, sidebar
and tool mounting all come from the core.

## The seven core tools

| id | Built for | What it does |
|---|---|---|
| `placeValue` | place value, trading | Discs that auto-trade at ten; ×10 and ÷10 shift the whole set |
| `rounding` | rounding to any place | Number line with the midpoint drawn; marker animates to the nearer end |
| `shift` | powers of ten | Digits slide across the chart; overflow digits become the remainder |
| `stepper` | order of operations | Evaluates one operation per line, labelling why each goes next |
| `power` | exponents | Builds n, n², n³ from the same unit block |
| `barModel` | word problems | Part–whole and comparison modes, drawn to scale, solves for one unit |
| `factors` | factors, GCF, LCM | Builds every rectangle for a number; two-colour hundred chart |

Set `tools:{ 3:["barModel"] }` to mount one on day 3. Use `"all"` for a
review-station picker. Days left out of the map render no tool.

`barModel` and `stepper` carry across several units — reuse before rebuilding.

## Unit-specific tools already built

Defined via `window.__EXTRA_TOOLS__`. A tool a second unit needs gets promoted
into `curriculum-core.js` (as `decimalGrid` and `rateLine` were) rather than copied.

| id | Lives in | What it does |
|---|---|---|
| `fractionModel` | unit 02 | Four modes: equivalence by re-cutting, comparison and addition at a common denominator, and an area square for multiplication |
| `fractionDivide` | unit 02 | Measurement model — fits divisor-sized groups along the dividend bar, counts them, and derives invert-and-multiply from the common-denominator line |
| `balanceScale` | unit 05, `balance-scale.js` | An equation as a pan balance that tips when both sides aren't treated alike |
| `angleChase` | unit 06, `angle-chase.js` | Reveals one reasoning step at a time, naming the angle rule behind each |
| `circleUnroll`, `circleWedges` | unit 07, `circle-tools.js` | Unrolls a circumference against its diameter; rearranges wedges into a near-parallelogram |
| `netFold` | unit 08, `net-fold.js` | Lay out a net on a keyboard-friendly grid; it says which rule a bad net breaks, then folds it up in 3D |
| `distBuilder` | unit 09, `dist-builder.js` | One dataset in three linked views: dot plot, histogram and summary measures; change the bin width, drag an outlier and watch the mean move while the median holds |
| `coordPlane` | unit 10, `coord-plane.js` | Plot points and read their quadrant, reflect across an axis, and build a polygon to find its perimeter and area |

## Look and feel

The look follows David's "Budapest" direction (2026-10-16): hand-made, textured,
calm where students read. In `curriculum.css`:

- **Colours in `oklch`, light and dark.** Bare hues (`--teal`, `--amber`, `--peri`,
  `--rose`) are for fills and lines; their `-text` twins are the shades that pass
  4.5:1 as text. Rose is a terracotta, not a pink. Tools stay a light paper card
  in dark mode, pinned to the light palette.
- **Dark frames** (unit headers, and on the hub the hero and access band) carry a
  compass-rosette pattern, the overlapping circles under Zsolnay tile, and end in
  a wave. Any box holding text on a frame is solid, so the pattern never shows
  through words.
- **Cards** have petal corners and a double rule.
- **Motion** is driven by the reader: headers rise in, the pattern drifts with the
  scroll, a chosen day settles in, cards lift straight up on hover, and the header
  carries across between pages. All of it is skipped when the device asks for
  reduced motion. Nothing loops on its own and nothing tilts text.

The hub's own parts (hero, year tiles, stage and unit cards) are in its page.
Contrast is checked in both themes for every day of every unit.

## 3D tools

Real 3D is used only inside geometry tools, where the solid is what's taught
(Unit 8's fold preview). Labels stay flat. Three.js is bundled with esbuild into
one committed script, so pages still open from disk and load nothing from other
sites. After editing `src/net-fold-3d.js`, run `npm run build:3d`. The standard
for adding more is `docs/3d-tools.md`.

## Adding a unit-specific tool

Define `window.__EXTRA_TOOLS__` and `window.__EXTRA_NAMES__` **before** the
`curriculum-core.js` tag, then reference the id in `UNIT.tools`. The commented
block in the template shows the shape. Reuse the shared classes (`.tool`,
`.ctl`, `.btn`, `.stage-area`, `.out`) so it matches without new CSS.

## Non-negotiables

- **CPA order holds.** Concrete means a physical object in a student's hands.
  If a stage can't be done with materials, it isn't the concrete stage.
- **Every SVG gets a descriptive `aria-label`** carrying the same information
  as the drawing — matching the lesson's "say the picture aloud" script.
- **Reduced motion is respected.** Check
  `window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches`
  before animating.
- **Colour is never the only cue.** Pair it with labels, patterns or length.
- **Contrast is 4.5:1 for text in both themes.** Use the `-text` tokens for
  coloured text, never a bare hue or a hard-coded hex.
- **Real 3D only inside geometry tools**, labels flat; see `docs/3d-tools.md`.
- **Access notes are per-lesson**, naming the channel (touch, vision, hearing,
  language, attention, motor, memory) — not a boilerplate paragraph.
- **Mastery criteria are specific.** `crit` should name the signal that
  triggers reteaching, not just a score.

## Testing a unit before shipping

```
npm install                          # once: jsdom, plus three and esbuild
node test-unit.js unit-03-ratio-and-rate.html
node balance-scale.test.js           # each tool has its own test file
npm test                             # Unit 8: fold maths, netFold, the page
```

`test-unit.js` clicks through every day tab, checks each lesson is complete and
in CPA order, and asserts a tool mounts and every SVG is described. Every number
a tool shows must be asserted in its tests: a wrong answer inside a teaching tool
is worse than no tool.

## Model guidance

Units needing a genuinely new pedagogical visual — fraction division,
algebraic unknowns, deriving π, distribution builders — are worth Opus.
Units reusing existing tools are template work; Sonnet handles them well.
One unit per session either way: unit files are large, and carrying two of them
in context degrades output before you finish the second.

## License

Licensed under [CC BY 4.0](LICENSE) — free to use, adapt, and share
(including commercially) with attribution to David Petry.
