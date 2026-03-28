import { describe, expect, it } from "vitest";

import {
  GRID_SIZE,
  findMatches,
  generateBoardWithoutMatches,
  isAdjacent,
  swapCells,
  trySwap,
} from "./game-engine";

describe("game-engine", () => {
  it("generates board without initial matches", () => {
    let s = 123456789;
    const rng = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
    const b = generateBoardWithoutMatches(rng);
    expect(b.length).toBe(GRID_SIZE);
    expect(findMatches(b).size).toBe(0);
  });

  it("detects horizontal match", () => {
    const b = generateBoardWithoutMatches(() => 0.1);
    b[3]![3] = 0;
    b[3]![4] = 0;
    b[3]![5] = 0;
    const m = findMatches(b);
    expect(m.has("3,3") && m.has("3,4") && m.has("3,5")).toBe(true);
  });

  it("rejects non-adjacent swap", () => {
    const b = generateBoardWithoutMatches(() => 0.2);
    const r = trySwap(b, 0, 0, 0, 2);
    expect(r.valid).toBe(false);
  });

  it("isAdjacent works for orthogonal neighbors", () => {
    expect(isAdjacent(0, 0, 0, 1)).toBe(true);
    expect(isAdjacent(0, 0, 1, 0)).toBe(true);
    expect(isAdjacent(0, 0, 1, 1)).toBe(false);
  });

  it("swapCells swaps", () => {
    const b = generateBoardWithoutMatches(() => 0.3);
    const a = b[0]![0];
    const d = b[0]![1];
    const s = swapCells(b, 0, 0, 0, 1);
    expect(s[0]![0]).toBe(d);
    expect(s[0]![1]).toBe(a);
  });
});
