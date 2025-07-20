export interface TetrisState {
  board: number[][];
  currentPiece: Piece;
  nextPiece: Piece;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  isPaused: boolean;
  dropTime: number;
  lastDrop: number;
}

export interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export interface GameStats {
  score: number;
  level: number;
  lines: number;
}

export interface NextPieceProps {
  piece: Piece;
} 