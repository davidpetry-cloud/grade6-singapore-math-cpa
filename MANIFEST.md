# MANIFEST — Grade 6 Singapore Math (CPA)

**Bundle version:** complete (through-u10)
**Built:** 2026-09-16 — UI/dark-mode pass, plus a content consistency audit (deduped
cloned review-day text, deepened thin dialogue, fixed two reasoning prompts,
corrected Unit 7's day count)

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
| `CLAUDE.md` | 14,392 | `f3efecce649d26cc` |
| `README.md` | 4,714 | `6d2d5ebf47ada6c8` |
| `angle-chase.js` | 10,540 | `64345ee7b08fb720` |
| `angle-chase.test.js` | 4,719 | `59cf3f33124df385` |
| `balance-scale.js` | 9,739 | `fb82b099870cd770` |
| `balance-scale.test.js` | 3,260 | `18d60ecff41e5566` |
| `circle-tools.js` | 12,165 | `463bdc8224da371b` |
| `circle-tools.test.js` | 3,842 | `458c1ec1afe4c5d9` |
| `coord-plane.js` | 11,556 | `e75b1e65f83ee155` |
| `coord-plane.test.js` | 4,516 | `62238f169083fde3` |
| `curriculum-core.js` | 52,034 | `14672705ecac7e16` |
| `curriculum.css` | 16,732 | `79153058c6ae9ef1` |
| `dist-builder.js` | 9,161 | `4f8f09c5a6594861` |
| `dist-builder.test.js` | 3,911 | `0910cafcf6db26fc` |
| `net-fold.js` | 9,248 | `1fb9b6210fdc651c` |
| `net-fold.test.js` | 4,433 | `8e918d5ca40037fc` |
| `singapore-math-6-hub.html` | 22,494 | `374da3667ceceb0a` |
| `test-unit.js` | 4,235 | `760c86dcdd48f57f` |
| `theme-toggle.js` | 1,187 | `18c8994a2a613f0c` |
| `unit-01-whole-numbers-and-operations.html` | 62,533 | `eafae926615998ba` |
| `unit-02-fractions-and-decimals.html` | 158,639 | `c3fd5353af5f768a` |
| `unit-03-ratio-and-rate.html` | 104,491 | `0039f377da93287d` |
| `unit-04-percentage.html` | 88,294 | `96bda583b78f40d3` |
| `unit-05-algebra.html` | 126,468 | `da6caaa26d84eba2` |
| `unit-06-angles-and-figures.html` | 95,184 | `f70a2b87d28fa821` |
| `unit-07-circles.html` | 92,729 | `1875db289276260b` |
| `unit-08-volume.html` | 93,138 | `3e064930f505d356` |
| `unit-09-data-and-statistics.html` | 103,945 | `698ba3d1b5a78d92` |
| `unit-10-integers-and-coordinates.html` | 93,882 | `29cf6b9096a3bd47` |
| `unit-template.html` | 5,871 | `3a660bf7345ee1d5` |

## Unit status

**All ten units complete. 149 instructional days across the full Grade 6 year.**


| unit | topic | days | status |
|---|---|---|---|
| 01 | Whole Numbers & Order of Operations | 10 | ready |
| 02 | Fractions & Decimals | 20 | ready |
| 03 | Ratio & Rate | 15 | ready |
| 04 | Percentage | 15 | ready |
| 05 | Algebraic Expressions & Equations | 20 | ready |
| 06 | Angles & Geometric Figures | 13 | ready |
| 07 | Circles | 13 | ready |
| 08 | Volume of Solids | 15 | ready |
| 09 | Data Analysis & Statistics | 15 | ready |
| 10 | Negative Numbers & Coordinate Plane | 13 | ready |

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
