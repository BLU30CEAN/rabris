export type BlockType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Block {
  type: BlockType;
  shape: number[][];
  color: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  board: (BlockType | null)[][];
  currentPiece: {
    type: BlockType;
    position: Position;
    shape: number[][];
  } | null;
  score: number;
  level: number;
  linesCleared: number;
  gameOver: boolean;
  isPaused: boolean;
}

export interface GameStats {
  score: number;
  level: number;
  linesCleared: number;
}
