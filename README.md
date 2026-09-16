# Grade 6 Singapore Math (CPA) — build guide

Everything lives in one flat folder. No build step, no server; open the HTML
files straight from disk.

```
singapore-math-6-hub.html          year overview, pacing bar model, unit index
curriculum.css                     all styling — tokens, layout, tool styles
curriculum-core.js                 lesson renderer + 7 interactive manipulatives
unit-template.html                 start here for a new unit
unit-01-whole-numbers-and-operations.html
unit-02-… (etc.)
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

Unit 2 defines three of its own via `window.__EXTRA_TOOLS__`. If Units 3, 4 or 8
need them, copy the block rather than rebuilding, or promote them into
`curriculum-core.js`.

| id | Lives in | What it does |
|---|---|---|
| `fractionModel` | unit 02 | Four modes: equivalence by re-cutting, comparison and addition at a common denominator, and an area square for multiplication |
| `fractionDivide` | unit 02 | Measurement model — fits divisor-sized groups along the dividend bar, counts them, and derives invert-and-multiply from the common-denominator line |
| `decimalGrid` | unit 02 | Hundredths grid in four modes: represent, compare, add/subtract, and two-way area shading for multiplication |

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
- **Access notes are per-lesson**, naming the channel (touch, vision, hearing,
  language, attention, motor, memory) — not a boilerplate paragraph.
- **Mastery criteria are specific.** `crit` should name the signal that
  triggers reteaching, not just a score.

## Testing a unit before shipping

`npm install jsdom`, then load the file with `runScripts:"dangerously"` and
`resources:"usable"`, stub `window.matchMedia`, click through every day tab and
assert a tool mounts. If the unit uses `stepper`, assert every worksheet
expression evaluates correctly — a wrong answer inside a teaching tool is worse
than no tool.

## Model guidance

Units needing a genuinely new pedagogical visual — fraction division,
algebraic unknowns, deriving π, distribution builders — are worth Opus.
Units reusing existing tools are template work; Sonnet handles them well.
One unit per session either way: unit files are large, and carrying two of them
in context degrades output before you finish the second.

## License

Licensed under [CC BY 4.0](LICENSE) — free to use, adapt, and share
(including commercially) with attribution to David Petry.
