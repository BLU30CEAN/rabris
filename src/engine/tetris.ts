// Pure tetris engine — no React, no DOM.
// Tetromino shape stored as 4x4 matrix for consistent rotation/preview math.

export type PieceLetter = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
export type CellValue = PieceLetter | "G" | null; // G = ghost (preview)
export type Board = CellValue[][];

export interface Piece {
  letter: PieceLetter;
  shape: number[][]; // 4x4 binary matrix
  x: number;
  y: number;
}

export interface GameState {
  board: Board;
  active: Piece;
  next: Piece;
  bag: PieceLetter[];
  score: number;
  level: number;
  lines: number;
  status: "ready" | "playing" | "paused" | "over";
  combo: number;
}

export const COLS = 10;
export const ROWS = 20;

// Shapes are stored as a single canonical orientation in a 4x4 grid,
// kept compact so rotation produces tight blocks (esp. I, O).
const SHAPES_4: Record<PieceLetter, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  T: [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
  ],
  Z: [
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  L: [
    [0, 0, 0, 0],
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
};

export const PIECE_COLORS: Record<PieceLetter, string> = {
  I: "#4FC4E6", // sky
  O: "#F7C84F", // amber
  T: "#B97DEF", // lilac
  S: "#5FD49A", // mint
  Z: "#F46B7B", // coral
  J: "#4A8EE8", // royal
  L: "#F3925A", // peach
};

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<CellValue>(COLS).fill(null));
}

// 7-bag randomizer: guarantees every 7-piece window contains each tetromino once.
export function newBag(): PieceLetter[] {
  const bag: PieceLetter[] = ["I", "O", "T", "S", "Z", "J", "L"];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function makePiece(letter: PieceLetter): Piece {
  const shape = SHAPES_4[letter].map((r) => [...r]);
  return { letter, shape, x: 3, y: -1 }; // spawn just above visible area
}

/** Rotate 4x4 matrix clockwise. */
export function rotateCW(m: number[][]): number[][] {
  const n = m.length;
  const out: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) out[x][n - 1 - y] = m[y][x];
  return out;
}

function cellsOf(piece: Piece): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let y = 0; y < piece.shape.length; y++)
    for (let x = 0; x < piece.shape[y].length; x++)
      if (piece.shape[y][x]) out.push([piece.x + x, piece.y + y]);
  return out;
}

export function collides(piece: Piece, board: Board): boolean {
  for (const [x, y] of cellsOf(piece)) {
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y >= 0 && board[y][x]) return true;
  }
  return false;
}

/** Try simple wall-kick offsets. Order keeps the rotation visually predictable. */
const KICK_OFFSETS: Array<[number, number]> = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [-2, 0],
  [2, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
];

export function tryRotate(piece: Piece, board: Board): Piece {
  // O never needs to rotate.
  if (piece.letter === "O") return piece;
  const rotated = rotateCW(piece.shape);
  for (const [dx, dy] of KICK_OFFSETS) {
    const candidate: Piece = { ...piece, shape: rotated, x: piece.x + dx, y: piece.y + dy };
    if (!collides(candidate, board)) return candidate;
  }
  return piece; // no kick worked — keep original
}

export function tryMove(piece: Piece, board: Board, dx: number, dy: number): Piece | null {
  const candidate: Piece = { ...piece, x: piece.x + dx, y: piece.y + dy };
  return collides(candidate, board) ? null : candidate;
}

export function ghostOf(piece: Piece, board: Board): Piece {
  let g = piece;
  while (true) {
    const next = tryMove(g, board, 0, 1);
    if (!next) return g;
    g = next;
  }
}

export function merge(piece: Piece, board: Board): Board {
  const out = board.map((r) => r.slice());
  for (const [x, y] of cellsOf(piece)) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) out[y][x] = piece.letter;
  }
  return out;
}

/** Returns { board, cleared } */
export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((c) => !c));
  const cleared = ROWS - kept.length;
  const empties: Board = Array.from({ length: cleared }, () => Array<CellValue>(COLS).fill(null));
  return { board: empties.concat(kept), cleared };
}

/** Modern Tetris scoring (NES-ish base). */
export function scoreFor(cleared: number, level: number, combo: number): number {
  const base = [0, 100, 300, 500, 800][cleared] ?? 0;
  const comboBonus = combo > 0 ? combo * 50 * level : 0;
  return base * level + comboBonus;
}

export function levelOf(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

export function dropIntervalMs(level: number): number {
  // Falls fast as you level up. Floor at 80ms.
  return Math.max(80, 800 - (level - 1) * 65);
}

export function pieceMatrixForPreview(letter: PieceLetter): number[][] {
  return SHAPES_4[letter].map((r) => [...r]);
}
