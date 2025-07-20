import { Block, BlockType } from "../types/TetrisTypes";

export const TETRIS_BLOCKS: Record<BlockType, Block> = {
  // 일반적인 테트리스 블록들
  I: {
    type: "I",
    shape: [[1, 1, 1, 1]],
    color: "#00F5FF", // 시안색
  },
  O: {
    type: "O",
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#FFFF00", // 노란색
  },
  T: {
    type: "T",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#800080", // 보라색
  },
  S: {
    type: "S",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00FF00", // 초록색
  },
  Z: {
    type: "Z",
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#FF0000", // 빨간색
  },
  J: {
    type: "J",
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#0000FF", // 파란색
  },
  L: {
    type: "L",
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#FFA500", // 주황색
  },

  // 기존 블록들 (주석처리)
  /*
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
  */
};

export const getRandomBlock = (): BlockType => {
  const blockTypes: BlockType[] = ["I", "O", "T", "S", "Z", "J", "L"];
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
