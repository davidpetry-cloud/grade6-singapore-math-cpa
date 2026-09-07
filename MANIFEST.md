# MANIFEST — Grade 6 Singapore Math (CPA)

**Bundle version:** through-u02
**Built:** 2026-09-07

The hub's `UNITS` array is the source of truth for what exists. This file is a
convenience snapshot — if the two ever disagree, believe the hub.

## Overwrite an existing copy

Finder's Archive Utility will NOT merge into an existing folder; it creates
`grade6-singapore-math-cpa 2`. Use the terminal instead, from the directory
that holds your working folder:

```
unzip -o grade6-singapore-math-cpa-through-uNN.zip
```

`-o` overwrites without prompting. Files you added yourself are left alone;
only the seven tracked files are replaced.

## Verify what changed since your last download

```
shasum -a 256 *.html *.css *.js *.md | cut -c1-16
```

Compare against the table below. A differing hash means that file changed in
this bundle; an identical hash means it did not, and you can skip re-reading it.

| file | bytes | sha256 (first 16) |
|---|---|---|
| `CLAUDE.md` | 4,824 | `11a5dc0b15d21b73` |
| `README.md` | 4,714 | `6d2d5ebf47ada6c8` |
| `curriculum-core.js` | 31,634 | `a29618c09cf4ed24` |
| `curriculum.css` | 13,193 | `b67d7d1bf35ce4af` |
| `singapore-math-6-hub.html` | 20,624 | `a3cd7b859a9c737a` |
| `test-unit.js` | 3,789 | `8983497562dd96df` |
| `unit-01-whole-numbers-and-operations.html` | 62,096 | `fd32edf62e0a2b75` |
| `unit-02-fractions-and-decimals.html` | 158,134 | `794f8298cbf5223b` |
| `unit-template.html` | 5,434 | `136b856553bad138` |

## Unit status

| unit | topic | days | status |
|---|---|---|---|
| 01 | Whole Numbers & Order of Operations | 10 | ready |
| 02 | Fractions & Decimals | 20 | ready |
| 03 | Ratio & Rate | 15 | not built |
| 04 | Percentage | 15 | not built |
| 05 | Algebraic Expressions & Equations | 20 | not built |
| 06 | Angles & Geometric Figures | 15 | not built |
| 07 | Circles | 15 | not built |
| 08 | Volume of Solids | 15 | not built |
| 09 | Data Analysis & Statistics | 15 | not built |
| 10 | Negative Numbers & Coordinate Plane | 10 | not built |

## Test before shipping a new unit

`npm install jsdom` once, then:

```
node test-unit.js unit-03-ratio-and-rate.html
```

Defaults to Unit 2 if no filename is given. The harness adapts to the lesson
count, so it works on a 10-day unit and a 20-day unit without editing. It
checks structural completeness of every lesson, CPA stage order, stage timings
against the lesson length, that a tool mounts on every day, and that every
mounted SVG carries a descriptive `aria-label`.
