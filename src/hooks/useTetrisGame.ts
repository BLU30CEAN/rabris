import { useState, useEffect, useCallback } from "react";
import { GameState, Position, BlockType } from "../types/TetrisTypes";
import {
  TETRIS_BLOCKS,
  getRandomBlock,
  rotateBlock,
} from "../utils/tetrisBlocks";
import { soundManager } from "../utils/soundManager";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const createEmptyBoard = (): (BlockType | null)[][] => {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
};

const isValidPosition = (
  shape: number[][],
  position: Position,
  board: (BlockType | null)[][]
): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = position.x + x;
        const boardY = position.y + y;

        if (
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          boardY >= BOARD_HEIGHT ||
          (boardY >= 0 && board[boardY][boardX] !== null)
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

const placePiece = (
  board: (BlockType | null)[][],
  piece: GameState["currentPiece"]
): (BlockType | null)[][] => {
  if (!piece) return board;

  const newBoard = board.map((row) => [...row]);
  const { shape, position, type } = piece;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardY = position.y + y;
        const boardX = position.x + x;
        if (boardY >= 0) {
          newBoard[boardY][boardX] = type;
        }
      }
    }
  }

  return newBoard;
};

const clearLines = (
  board: (BlockType | null)[][]
): {
  newBoard: (BlockType | null)[][];
  linesCleared: number;
} => {
  let linesCleared = 0;
  const newBoard = board.filter((row) => {
    const isFull = row.every((cell) => cell !== null);
    if (isFull) {
      linesCleared++;
      return false;
    }
    return true;
  });

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { newBoard, linesCleared };
};

const calculateScore = (linesCleared: number, level: number): number => {
  const lineScores = [0, 100, 300, 500, 800];
  return lineScores[linesCleared] * (level + 1);
};

export const useTetrisGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    score: 0,
    level: 1,
    linesCleared: 0,
    gameOver: false,
    isPaused: false,
  });

  const spawnNewPiece = useCallback(() => {
    const blockType = getRandomBlock();
    const block = TETRIS_BLOCKS[blockType];
    const newPiece = {
      type: blockType,
      position: {
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(block.shape[0].length / 2),
        y: 0,
      },
      shape: block.shape,
    };

    if (!isValidPosition(newPiece.shape, newPiece.position, gameState.board)) {
      soundManager.playGameOver();
      setGameState((prev) => ({ ...prev, gameOver: true }));
      return;
    }

    setGameState((prev) => ({ ...prev, currentPiece: newPiece }));
  }, [gameState.board]);

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (gameState.gameOver || gameState.isPaused || !gameState.currentPiece)
        return;

      const newPosition = {
        x: gameState.currentPiece.position.x + dx,
        y: gameState.currentPiece.position.y + dy,
      };

      if (
        isValidPosition(
          gameState.currentPiece.shape,
          newPosition,
          gameState.board
        )
      ) {
        setGameState((prev) => ({
          ...prev,
          currentPiece: prev.currentPiece
            ? {
                ...prev.currentPiece,
                position: newPosition,
              }
            : null,
        }));
        // 이동 사운드 재생
        soundManager.playMove();
      } else if (dy > 0) {
        // 블록을 놓을 수 없고 아래로 이동하려고 할 때
        const newBoard = placePiece(gameState.board, gameState.currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        const scoreIncrease = calculateScore(linesCleared, gameState.level);
        const newLevel =
          Math.floor((gameState.linesCleared + linesCleared) / 10) + 1;

        // 사운드 재생
        soundManager.playDrop();
        if (linesCleared > 0) {
          soundManager.playLineClear();
        }
        if (newLevel > gameState.level) {
          soundManager.playLevelUp();
        }

        setGameState((prev) => ({
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: prev.score + scoreIncrease,
          level: newLevel,
          linesCleared: prev.linesCleared + linesCleared,
        }));

        setTimeout(spawnNewPiece, 0);
      }
    },
    [gameState, spawnNewPiece]
  );

  const rotateCurrentPiece = useCallback(() => {
    if (gameState.gameOver || gameState.isPaused || !gameState.currentPiece)
      return;

    const rotatedShape = rotateBlock(gameState.currentPiece.shape);

    if (
      isValidPosition(
        rotatedShape,
        gameState.currentPiece.position,
        gameState.board
      )
    ) {
      setGameState((prev) => ({
        ...prev,
        currentPiece: prev.currentPiece
          ? {
              ...prev.currentPiece,
              shape: rotatedShape,
            }
          : null,
      }));
      // 회전 사운드 재생
      soundManager.playRotate();
    }
  }, [gameState]);

  const dropPiece = useCallback(() => {
    if (gameState.gameOver || gameState.isPaused) return;
    movePiece(0, 1);
  }, [gameState.gameOver, gameState.isPaused, movePiece]);

  const resetGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: null,
      score: 0,
      level: 1,
      linesCleared: 0,
      gameOver: false,
      isPaused: false,
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // 자동 낙하
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    const interval = setInterval(() => {
      movePiece(0, 1);
    }, Math.max(100, 1000 - (gameState.level - 1) * 100));

    return () => clearInterval(interval);
  }, [gameState.gameOver, gameState.isPaused, gameState.level, movePiece]);

  // 새 조각 생성
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.gameOver) {
      spawnNewPiece();
    }
  }, [gameState.currentPiece, gameState.gameOver, spawnNewPiece]);

  return {
    gameState,
    movePiece,
    rotateCurrentPiece,
    dropPiece,
    resetGame,
    togglePause,
  };
};
