# Clearance Rules

How to check whether a multi-mechanism design will actually close flat without elements colliding or binding.

---

## Core Principle

Every pop-up element, when the card is closed, folds flat against the base card. Its **closed footprint** is the area it occupies when lying flat. Two elements on the same side of the gutter must not have overlapping closed footprints.

---

## Closed Footprint by Mechanism

### V-Fold element
- Attachment point = distance from gutter where the element is glued, call it `p` (mm)
- Element height when open = `h` (mm)
- **Closed footprint:** a strip from `p` to `p + h` mm from the gutter
- The element lies flat, extending away from the gutter by `h` mm

### Box Fold
- Cut depth = `d` (mm) — the length of the two parallel cuts
- **Closed footprint:** a strip from `0` to `d` mm from the gutter (the box collapses into this zone)
- Nothing else can be glued or placed in this zone on the same side

### Floating Layer
- Pedestals fold inward when card closes
- **Closed footprint:** the full panel area plus the pedestal strip width (~10mm) extending inward from each pedestal base
- Ensure no other element's footprint overlaps the pedestal base positions

---

## Minimum Clearance Rules

### Between a Box Fold and a V-Fold (same side)
```
V-fold attachment point p ≥ box fold depth d + 10mm
```
The 10mm buffer prevents the V-fold from sitting in the crease zone of the box fold, which would cause binding.

**Example:** Box fold with d = 30mm → V-fold chair must be attached at p ≥ 40mm from gutter.

### Between two V-Folds (same side)
```
p2 ≥ p1 + h1 + 8mm
```
Where element 1 is closer to the gutter (p1 < p2). The 8mm buffer prevents the closed pieces from pressing against each other and popping open.

**Example:** Chair 1 at p=40mm, height h=50mm → Chair 2 must be at p ≥ 98mm. If card half-width is 108mm, that leaves only 10mm to the edge — too tight. Use a wider card or shorter chairs.

### Element to card edge
```
p + h ≤ card_half_width - 8mm
```
Every element must fold flat with at least 8mm clearance from the card edge, or it will stick out when closed.

---

## Full Closure Check (run this before finalising any design)

For each side of the gutter, list all elements ordered by distance from gutter:

| Element | Attachment p (mm) | Height h (mm) | Closed footprint |
|---|---|---|---|
| Box fold | 0 | — | 0 → d |
| Chair | p1 | h1 | p1 → p1+h1 |
| Background panel | p2 | h2 | p2 → p2+h2 |

Check:
1. No footprint overlaps any other footprint
2. Each footprint respects the 8mm edge margin
3. Box fold zone (0 → d) is clear of all V-fold attachments

If any check fails, either reduce element heights, move attachment points further from the gutter, or use a larger card.

---

## Table + Two Chairs: Worked Example

Card: 216 × 140mm flat → 108mm half-width per side
Box fold table: d = 30mm, w = 60mm (table width)
Target: chairs on each side with photo panels

**Step 1 — Box fold zone:** 0 → 30mm. Clear.

**Step 2 — Chair placement:**
- Chair attachment: p = 30 + 10 = **40mm from gutter** ✓
- Chair height needed for readable photo: h = **60mm** (see photo-placement-sizing.md)
- Chair closed footprint: 40 → 100mm
- Edge clearance: 108 - 100 = 8mm ✓ (just meets the minimum)

**Step 3 — Verify card size is adequate:**
- 108mm half-width accommodates a 60mm tall chair at 40mm offset. Confirmed.

**Conclusion:** This design works but is tight. For more comfortable clearance, use a 130 × 180mm card (90mm half-width each side) — NO, that's narrower. Use 160 × 220mm flat (110mm half-width) or reduce chair height to 50mm and accept a smaller photo (see photo-placement-sizing.md for minimum readable size).

---

## Red Flags — Reject the Design If:

- Any element footprint overlaps another
- `p + h > card_half_width - 8mm` for any element
- Box fold depth `d > card_half_width / 2` (the box collapses into more than half the card — unstable)
- More than 3 V-fold elements on one side (cumulative footprints almost always exceed card width)
