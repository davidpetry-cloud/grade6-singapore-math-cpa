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
| `angle-chase.js` | 10,490 | `2daf3c83b7d8e0cd` |
| `angle-chase.test.js` | 4,719 | `59cf3f33124df385` |
| `balance-scale.js` | 9,724 | `5d0f15f7daa87323` |
| `balance-scale.test.js` | 3,260 | `18d60ecff41e5566` |
| `circle-tools.js` | 12,120 | `53d7afbb63bdd136` |
| `circle-tools.test.js` | 3,842 | `458c1ec1afe4c5d9` |
| `coord-plane.js` | 11,531 | `6f8c6bd070b347e2` |
| `coord-plane.test.js` | 4,516 | `62238f169083fde3` |
| `curriculum-core.js` | 51,949 | `4d9ea089543c8b4f` |
| `curriculum.css` | 16,712 | `43d735ac0084ef87` |
| `dist-builder.js` | 9,126 | `28d5e5b2a03283af` |
| `dist-builder.test.js` | 3,911 | `0910cafcf6db26fc` |
| `net-fold.js` | 9,243 | `949f6ef7b1e2807d` |
| `net-fold.test.js` | 4,433 | `8e918d5ca40037fc` |
| `singapore-math-6-hub.html` | 22,395 | `418318c1a5baf8fd` |
| `test-unit.js` | 4,235 | `760c86dcdd48f57f` |
| `theme-toggle.js` | 1,187 | `18c8994a2a613f0c` |
| `unit-01-whole-numbers-and-operations.html` | 62,494 | `482237ee4adf9d79` |
| `unit-02-fractions-and-decimals.html` | 158,500 | `f1f789cca47613fb` |
| `unit-03-ratio-and-rate.html` | 104,442 | `84cbe450f152b8e3` |
| `unit-04-percentage.html` | 88,255 | `8a2abc8e3b61f006` |
| `unit-05-algebra.html` | 126,414 | `954a92f3be822552` |
| `unit-06-angles-and-figures.html` | 95,095 | `66e6fde6910fe4bc` |
| `unit-07-circles.html` | 92,645 | `ec98e0a627db88bf` |
| `unit-08-volume.html` | 93,094 | `e6ae9a7133be80ae` |
| `unit-09-data-and-statistics.html` | 103,871 | `cdab076066830f01` |
| `unit-10-integers-and-coordinates.html` | 93,818 | `b38c722baf6d72db` |
| `unit-template.html` | 5,832 | `33ab7104d6682eb8` |

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
