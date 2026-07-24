export type Direction = "up" | "down" | "left" | "right";

export interface Cell {
  row: number;
  col: number;
}

/** A layout config: row-major `cells`, 1 = a slide, 0 = empty. */
export interface Layout {
  name: string;
  rows: number;
  cols: number;
  cells: number[];
}

export interface Slide {
  row: number;
  col: number;
  label: string;
  color: string;
}

export interface ParsedLayout {
  name: string;
  rows: number;
  cols: number;
  filled: Set<string>;
  slides: Slide[];
}

export const cellKey = (row: number, col: number): string => `${row},${col}`;

/** Expand a Layout into a filled-cell set plus labelled, coloured slides. */
export function parseLayout(layout: Layout): ParsedLayout {
  const filled = new Set<string>();
  const slides: Slide[] = [];

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      if (layout.cells[row * layout.cols + col] !== 1) continue;
      const index = slides.length;
      filled.add(cellKey(row, col));
      slides.push({
        row,
        col,
        label: String(index + 1),
        // Distinct hue per slide, derived from fill order.
        color: `hsl(${(index * 47) % 360} 70% 52%)`,
      });
    }
  }

  return { name: layout.name, rows: layout.rows, cols: layout.cols, filled, slides };
}

const DELTA: Record<Direction, Cell> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

/** The neighbour cell in `dir`, or null if it is empty / off the grid. */
export function nextCell(
  current: Cell,
  dir: Direction,
  parsed: ParsedLayout,
): Cell | null {
  const target = {
    row: current.row + DELTA[dir].row,
    col: current.col + DELTA[dir].col,
  };
  return parsed.filled.has(cellKey(target.row, target.col)) ? target : null;
}

/** Which of the four directions currently lead to a filled neighbour. */
export function reachableDirections(
  current: Cell,
  parsed: ParsedLayout,
): Set<Direction> {
  const out = new Set<Direction>();
  (Object.keys(DELTA) as Direction[]).forEach((dir) => {
    if (nextCell(current, dir, parsed)) out.add(dir);
  });
  return out;
}

/** Opening cell: the filled slide nearest the grid centre, ties by reading order. */
export function entryCell(parsed: ParsedLayout): Cell {
  const cx = (parsed.cols - 1) / 2;
  const cy = (parsed.rows - 1) / 2;
  let best: Slide | null = null;
  let bestDist = Infinity;
  for (const s of parsed.slides) {
    const dist = (s.row - cy) ** 2 + (s.col - cx) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }
  return best ? { row: best.row, col: best.col } : { row: 0, col: 0 };
}

export const MOVE_THRESHOLD = 20;

/**
 * Map a 2D delta to a single direction, or null below `threshold`.
 * Positive dy = down, positive dx = right; vertical wins ties.
 * Wheel handlers pass raw deltas; touch handlers pass negated deltas
 * (swiping up should advance downward).
 */
export function axisDirection(
  dx: number,
  dy: number,
  threshold: number = MOVE_THRESHOLD,
): Direction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null;
  if (Math.abs(dy) >= Math.abs(dx)) return dy > 0 ? "down" : "up";
  return dx > 0 ? "right" : "left";
}
