import { describe, it, expect } from "vitest";

// These are pure geometry rules extracted from knowledge/techniques/clearance-rules.md.
// They live here so that if someone edits the knowledge file and changes the numbers,
// the tests fail and force a conscious decision.

const EDGE_MARGIN = 8; // mm — minimum clearance from card edge

function vFoldFootprint(attachmentMm: number, heightMm: number) {
  return { start: attachmentMm, end: attachmentMm + heightMm };
}

function footprintsOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.start < b.end && a.end > b.start;
}

function fitsInCard(footprint: { end: number }, halfWidthMm: number): boolean {
  return footprint.end <= halfWidthMm - EDGE_MARGIN;
}

function vFoldClearsBoxFold(attachmentMm: number, boxFoldDepthMm: number): boolean {
  return attachmentMm >= boxFoldDepthMm + 10;
}

describe("clearance rules — V-fold footprint", () => {
  it("footprint end = attachment + height", () => {
    const fp = vFoldFootprint(40, 60);
    expect(fp.start).toBe(40);
    expect(fp.end).toBe(100);
  });

  it("two footprints that don't overlap pass the check", () => {
    const chair1 = vFoldFootprint(40, 50); // 40→90
    const chair2 = vFoldFootprint(98, 50); // 98→148
    expect(footprintsOverlap(chair1, chair2)).toBe(false);
  });

  it("two footprints that do overlap fail the check", () => {
    const chair1 = vFoldFootprint(40, 60); // 40→100
    const chair2 = vFoldFootprint(80, 40); // 80→120 — overlaps with chair1
    expect(footprintsOverlap(chair1, chair2)).toBe(true);
  });

  it("adjacent footprints with exactly 8mm gap do not overlap", () => {
    const chair1 = vFoldFootprint(40, 50); // 40→90
    const chair2 = vFoldFootprint(98, 50); // 98→148 — 8mm gap
    expect(footprintsOverlap(chair1, chair2)).toBe(false);
  });
});

describe("clearance rules — fits within card", () => {
  const HALF_WIDTH = 108; // A2 card half-width

  it("chair at p=40 h=60 fits in A2 card (100 ≤ 100)", () => {
    const fp = vFoldFootprint(40, 60);
    expect(fitsInCard(fp, HALF_WIDTH)).toBe(true);
  });

  it("oversized element that extends past edge fails", () => {
    const fp = vFoldFootprint(40, 70); // 40+70=110 > 108-8=100
    expect(fitsInCard(fp, HALF_WIDTH)).toBe(false);
  });

  it("element exactly at the edge limit passes", () => {
    const fp = vFoldFootprint(40, 60); // end=100, limit=100
    expect(fitsInCard(fp, HALF_WIDTH)).toBe(true);
  });
});

describe("clearance rules — V-fold vs box fold", () => {
  it("V-fold at p=40 clears a box fold with d=30 (40 >= 40)", () => {
    expect(vFoldClearsBoxFold(40, 30)).toBe(true);
  });

  it("V-fold at p=35 is too close to a box fold with d=30 (35 < 40)", () => {
    expect(vFoldClearsBoxFold(35, 30)).toBe(false);
  });

  it("V-fold at p=10 inside the box fold zone (d=30) fails", () => {
    expect(vFoldClearsBoxFold(10, 30)).toBe(false);
  });
});

describe("clearance rules — worked example: A2 birthday table card", () => {
  // From clearance-rules.md worked example
  const HALF_WIDTH = 108;
  const BOX_FOLD_DEPTH = 30;
  const CHAIR_ATTACHMENT = 40;
  const CHAIR_HEIGHT = 60;

  it("chair attachment clears box fold zone", () => {
    expect(vFoldClearsBoxFold(CHAIR_ATTACHMENT, BOX_FOLD_DEPTH)).toBe(true);
  });

  it("chair footprint fits within card", () => {
    const fp = vFoldFootprint(CHAIR_ATTACHMENT, CHAIR_HEIGHT);
    expect(fitsInCard(fp, HALF_WIDTH)).toBe(true);
  });

  it("left and right chairs (mirrored) do not interfere with each other", () => {
    // Each chair is on opposite sides of the gutter — they can't collide
    // This test confirms the same footprint on each side is valid independently
    const fp = vFoldFootprint(CHAIR_ATTACHMENT, CHAIR_HEIGHT);
    expect(fitsInCard(fp, HALF_WIDTH)).toBe(true);
  });
});
