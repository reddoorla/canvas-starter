import type { Layout } from "./nav";

export type PresetName = "t4" | "plus5" | "grid6" | "grid9";

// cells are row-major, 1 = a slide, 0 = an empty cell.
export const PRESETS: Record<PresetName, Layout> = {
  t4: { name: "t4", rows: 2, cols: 3, cells: [1, 1, 1, 0, 1, 0] },
  plus5: {
    name: "plus5",
    rows: 3,
    cols: 3,
    cells: [0, 1, 0, 1, 1, 1, 0, 1, 0],
  },
  grid6: { name: "grid6", rows: 2, cols: 3, cells: [1, 1, 1, 1, 1, 1] },
  grid9: {
    name: "grid9",
    rows: 3,
    cols: 3,
    cells: [1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
};
