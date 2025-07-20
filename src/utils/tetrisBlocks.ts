import { Block, BlockType } from "../types/TetrisTypes";

export const TETRIS_BLOCKS: Record<BlockType, Block> = {
  ㅌ: {
    type: "ㅌ",
    shape: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#FF6B6B", // 빨간색
  },
  ㅗ: {
    type: "ㅗ",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#4ECDC4", // 청록색
  },
  ㄲ: {
    type: "ㄲ",
    shape: [
      [1, 1, 1, 1],
      [0, 1, 0, 1],
      [0, 1, 0, 1],
    ],
    color: "#45B7D1", // 파란색
  },
  ㅣ: {
    type: "ㅣ",
    shape: [[1], [1], [1], [1]],
    color: "#96CEB4", // 초록색
  },
};

export const getRandomBlock = (): BlockType => {
  const blockTypes: BlockType[] = ["ㅌ", "ㅗ", "ㄲ", "ㅣ"];
  return blockTypes[Math.floor(Math.random() * blockTypes.length)];
};

export const rotateBlock = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = [];

  for (let i = 0; i < cols; i++) {
    rotated[i] = [];
    for (let j = 0; j < rows; j++) {
      rotated[i][j] = shape[rows - 1 - j][i];
    }
  }

  return rotated;
};
