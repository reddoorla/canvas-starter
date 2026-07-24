import { describe, it, expect } from "vitest";
import {
  parseLayout,
  nextCell,
  entryCell,
  reachableDirections,
  axisDirection,
  cellKey,
} from "./nav";
import { PRESETS } from "./presets";

const plus5 = parseLayout(PRESETS.plus5);
const t4 = parseLayout(PRESETS.t4);
const grid6 = parseLayout(PRESETS.grid6);
const grid9 = parseLayout(PRESETS.grid9);

describe("cellKey", () => {
  it("formats row,col", () => {
    expect(cellKey(1, 2)).toBe("1,2");
  });
});

describe("parseLayout", () => {
  it("counts filled cells as slides", () => {
    expect(plus5.slides).toHaveLength(5);
    expect(t4.slides).toHaveLength(4);
    expect(grid6.slides).toHaveLength(6);
    expect(grid9.slides).toHaveLength(9);
  });

  it("records rows/cols and a filled set", () => {
    expect(plus5.rows).toBe(3);
    expect(plus5.cols).toBe(3);
    expect(plus5.filled.has(cellKey(1, 1))).toBe(true); // center filled
    expect(plus5.filled.has(cellKey(0, 0))).toBe(false); // corner empty
  });

  it("labels slides 1..n in reading order and assigns distinct colors", () => {
    expect(plus5.slides[0].label).toBe("1");
    expect(plus5.slides[4].label).toBe("5");
    const colors = new Set(plus5.slides.map((s) => s.color));
    expect(colors.size).toBe(5);
  });
});

describe("nextCell", () => {
  it("moves to a filled neighbor", () => {
    expect(nextCell({ row: 1, col: 1 }, "down", plus5)).toEqual({
      row: 2,
      col: 1,
    });
    expect(nextCell({ row: 1, col: 1 }, "left", plus5)).toEqual({
      row: 1,
      col: 0,
    });
  });

  it("returns null toward an empty neighbor", () => {
    // from the top arm of the plus, left/right/up are empty
    expect(nextCell({ row: 0, col: 1 }, "left", plus5)).toBeNull();
    expect(nextCell({ row: 0, col: 1 }, "up", plus5)).toBeNull();
  });

  it("returns null off the grid edge", () => {
    expect(nextCell({ row: 0, col: 0 }, "up", grid9)).toBeNull();
    expect(nextCell({ row: 0, col: 0 }, "left", grid9)).toBeNull();
  });
});

describe("reachableDirections", () => {
  it("gives all four at the plus center", () => {
    const dirs = reachableDirections({ row: 1, col: 1 }, plus5);
    expect([...dirs].sort()).toEqual(["down", "left", "right", "up"]);
  });

  it("gives only down from the plus top arm", () => {
    const dirs = reachableDirections({ row: 0, col: 1 }, plus5);
    expect([...dirs]).toEqual(["down"]);
  });
});

describe("entryCell", () => {
  it("opens plus5 and grid9 at the center", () => {
    expect(entryCell(plus5)).toEqual({ row: 1, col: 1 });
    expect(entryCell(grid9)).toEqual({ row: 1, col: 1 });
  });

  it("opens t4 at the top-center hub", () => {
    expect(entryCell(t4)).toEqual({ row: 0, col: 1 });
  });

  it("opens grid6 at the top-center of its nearest-to-center row", () => {
    expect(entryCell(grid6)).toEqual({ row: 0, col: 1 });
  });
});

describe("axisDirection", () => {
  it("ignores tiny movements below threshold", () => {
    expect(axisDirection(2, 3, 20)).toBeNull();
  });

  it("picks the dominant axis", () => {
    expect(axisDirection(0, 30, 20)).toBe("down");
    expect(axisDirection(0, -30, 20)).toBe("up");
    expect(axisDirection(30, 0, 20)).toBe("right");
    expect(axisDirection(-30, 0, 20)).toBe("left");
  });

  it("prefers vertical on a tie", () => {
    expect(axisDirection(30, 30, 20)).toBe("down");
  });
});
