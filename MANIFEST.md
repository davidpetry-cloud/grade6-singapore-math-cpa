# MANIFEST — Grade 6 Singapore Math (CPA)

**Bundle version:** complete (through-u10)
**Built:** 2026-10-20 — light theme moved to warm sandstone (no bright
white), and sizes brought to Apple's Human Interface Guidelines
(17px body text, 44px touch targets, fades under reduce motion). Earlier:
2026-10-16 — the Budapest look rolled out to every unit (oklch palette in
light and dark, rosette header frames, petal cards, reader-driven motion), and
Unit 8's 3D fold preview. Earlier: 2026-09-16 UI/dark-mode pass and content audit

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
| `CLAUDE.md` | 16,399 | `30d1e39011503993` |
| `README.md` | 8,235 | `b4b4646e1d98cd18` |
| `angle-chase.js` | 10,627 | `af00877dbcb5767f` |
| `angle-chase.test.js` | 4,719 | `59cf3f33124df385` |
| `balance-scale.js` | 9,832 | `e299160c1db5b9b5` |
| `balance-scale.test.js` | 3,260 | `18d60ecff41e5566` |
| `circle-tools.js` | 12,255 | `298b0a3e73f2fe90` |
| `circle-tools.test.js` | 3,842 | `458c1ec1afe4c5d9` |
| `coord-plane.js` | 11,635 | `9af8d9734cb98007` |
| `coord-plane.test.js` | 4,516 | `62238f169083fde3` |
| `curriculum-core.js` | 52,440 | `213e91b37d634993` |
| `curriculum.css` | 31,775 | `cf28f92783945b68` |
| `dist-builder.js` | 9,230 | `09aca521536cd6e4` |
| `dist-builder.test.js` | 3,911 | `0910cafcf6db26fc` |
| `net-fold-3d.js` | 546,173 | `b821900a338331a8` |
| `net-fold-geometry.js` | 5,495 | `9751f04a7ef274d3` |
| `net-fold-geometry.test.js` | 5,345 | `3f30d719a1e857b2` |
| `net-fold.js` | 12,321 | `940bdd29007a1c08` |
| `net-fold.test.js` | 7,044 | `aba29e98162242e1` |
| `singapore-math-6-hub.html` | 29,951 | `c0a1d9656c205f30` |
| `test-unit.js` | 4,235 | `760c86dcdd48f57f` |
| `theme-toggle.js` | 1,187 | `18c8994a2a613f0c` |
| `unit-01-whole-numbers-and-operations.html` | 63,023 | `3792cb54f2befdd1` |
| `unit-02-fractions-and-decimals.html` | 158,361 | `da31a81a72cbb59b` |
| `unit-03-ratio-and-rate.html` | 104,141 | `5b390146931920d3` |
| `unit-04-percentage.html` | 87,954 | `b4ca8583bedd93b3` |
| `unit-05-algebra.html` | 126,221 | `e4020fdfd29836d0` |
| `unit-06-angles-and-figures.html` | 94,931 | `550b132030206ddc` |
| `unit-07-circles.html` | 92,922 | `1cd6ef2989006337` |
| `unit-08-volume.html` | 83,893 | `5cb0ba48b4ad48b0` |
| `unit-09-data-and-statistics.html` | 103,674 | `953234ef62674bf9` |
| `unit-10-integers-and-coordinates.html` | 94,031 | `12ccd459818b7e88` |
| `unit-template.html` | 5,531 | `3db9d2a347291ebd` |

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
