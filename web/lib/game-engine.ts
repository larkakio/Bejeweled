export const GRID_SIZE = 8;
export const GEM_TYPES = 6;

export type Cell = number;

export type Board = Cell[][];

export function createEmptyBoard(): Board {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 0),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

/** Random fill (may contain matches). */
export function randomFill(rng: () => number = Math.random): Board {
  const b = createEmptyBoard();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      b[r][c] = Math.floor(rng() * GEM_TYPES);
    }
  }
  return b;
}

export function findMatches(board: Board): Set<string> {
  const matched = new Set<string>();

  for (let r = 0; r < GRID_SIZE; r++) {
    let c = 0;
    while (c < GRID_SIZE) {
      let len = 1;
      while (
        c + len < GRID_SIZE &&
        board[r][c] === board[r][c + len]
      ) {
        len++;
      }
      if (len >= 3) {
        for (let k = 0; k < len; k++) matched.add(`${r},${c + k}`);
      }
      c += len;
    }
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let r = 0;
    while (r < GRID_SIZE) {
      let len = 1;
      while (
        r + len < GRID_SIZE &&
        board[r][c] === board[r + len][c]
      ) {
        len++;
      }
      if (len >= 3) {
        for (let k = 0; k < len; k++) matched.add(`${r + k},${c}`);
      }
      r += len;
    }
  }

  return matched;
}

export function swapCells(
  board: Board,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): Board {
  const b = cloneBoard(board);
  const t = b[r1][c1]!;
  b[r1][c1] = b[r2][c2]!;
  b[r2][c2] = t;
  return b;
}

export function isAdjacent(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

export function removeMatches(
  board: Board,
  matches: Set<string>,
): (Cell | null)[][] {
  const b: (Cell | null)[][] = board.map((row) => [...row]);
  for (const key of matches) {
    const [r, c] = key.split(",").map(Number);
    b[r]![c] = null;
  }
  return b;
}

export function applyGravity(board: (Cell | null)[][]): (Cell | null)[][] {
  const result: (Cell | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null as Cell | null),
  );
  for (let c = 0; c < GRID_SIZE; c++) {
    let wr = GRID_SIZE - 1;
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (board[r]![c] !== null) {
        result[wr]![c] = board[r]![c];
        wr--;
      }
    }
  }
  return result;
}

export function refill(
  board: (Cell | null)[][],
  rng: () => number = Math.random,
): Board {
  return board.map((row) =>
    row.map((cell) =>
      cell === null ? (Math.floor(rng() * GEM_TYPES) as Cell) : cell,
    ),
  ) as Board;
}

export function resolveCascade(
  board: Board,
  rng: () => number = Math.random,
): { board: Board; score: number; rounds: number } {
  let b = cloneBoard(board);
  let score = 0;
  let rounds = 0;

  while (true) {
    const m = findMatches(b);
    if (m.size === 0) break;
    rounds += 1;
    score += m.size * 10 * rounds;
    const cleared = removeMatches(b, m);
    const fallen = applyGravity(cleared);
    b = refill(fallen, rng);
  }

  return { board: b, score, rounds };
}

export function trySwap(
  board: Board,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  rng: () => number = Math.random,
): { board: Board; score: number; rounds: number; valid: boolean } {
  if (!isAdjacent(r1, c1, r2, c2)) {
    return { board, score: 0, rounds: 0, valid: false };
  }
  const swapped = swapCells(board, r1, c1, r2, c2);
  if (findMatches(swapped).size === 0) {
    return { board, score: 0, rounds: 0, valid: false };
  }
  const { board: after, score, rounds } = resolveCascade(swapped, rng);
  return { board: after, score, rounds, valid: true };
}

export function generateBoardWithoutMatches(
  rng: () => number = Math.random,
  maxAttempts = 800,
): Board {
  for (let i = 0; i < maxAttempts; i++) {
    const b = randomFill(rng);
    if (findMatches(b).size === 0) return b;
  }
  return randomFill(rng);
}
