# MANIFEST — Grade 6 Singapore Math (CPA)

**Bundle version:** through-u06
**Built:** 2026-09-10

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
| `CLAUDE.md` | 12,616 | `4db98251382a6616` |
| `README.md` | 4,714 | `6d2d5ebf47ada6c8` |
| `angle-chase.js` | 10,540 | `64345ee7b08fb720` |
| `angle-chase.test.js` | 4,719 | `59cf3f33124df385` |
| `balance-scale.js` | 9,739 | `fb82b099870cd770` |
| `balance-scale.test.js` | 3,260 | `18d60ecff41e5566` |
| `curriculum-core.js` | 51,921 | `bd010e838ba2a847` |
| `curriculum.css` | 13,193 | `b67d7d1bf35ce4af` |
| `singapore-math-6-hub.html` | 20,661 | `bce1d1b14ab4ba52` |
| `test-unit.js` | 4,235 | `760c86dcdd48f57f` |
| `unit-01-whole-numbers-and-operations.html` | 62,096 | `fd32edf62e0a2b75` |
| `unit-02-fractions-and-decimals.html` | 158,134 | `794f8298cbf5223b` |
| `unit-03-ratio-and-rate.html` | 104,085 | `e5ee14b100258515` |
| `unit-04-percentage.html` | 87,767 | `54bd3f4dc7161ce6` |
| `unit-05-algebra.html` | 125,841 | `68ff6a91a38e9c57` |
| `unit-06-angles-and-figures.html` | 93,992 | `f41d6652553310e8` |
| `unit-template.html` | 5,434 | `136b856553bad138` |

## Unit status

| unit | topic | days | status |
|---|---|---|---|
| 01 | Whole Numbers & Order of Operations | 10 | ready |
| 02 | Fractions & Decimals | 20 | ready |
| 03 | Ratio & Rate | 15 | ready |
| 04 | Percentage | 15 | ready |
| 05 | Algebraic Expressions & Equations | 20 | ready |
| 06 | Angles & Geometric Figures | 15 | not built |
| 07 | Circles | 15 | not built |
| 08 | Volume of Solids | 15 | not built |
| 09 | Data Analysis & Statistics | 15 | not built |
| 10 | Negative Numbers & Coordinate Plane | 13 | not built (grew from 10 days, absorbed 6.G.A.3) |

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
