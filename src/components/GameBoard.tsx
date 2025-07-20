import React from "react";
import styled from "styled-components";
import { GameState, BlockType } from "../types/TetrisTypes";
import { TETRIS_BLOCKS } from "../utils/tetrisBlocks";

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 30px);
  grid-template-rows: repeat(20, 30px);
  gap: 1px;
  background: #333;
  border: 3px solid #666;
  border-radius: 5px;
  padding: 10px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(10, 25px);
    grid-template-rows: repeat(20, 25px);
    gap: 1px;
    padding: 8px;
  }
`;

const Cell = styled.div<{ $hasBlock: boolean; $blockType?: BlockType }>`
  width: 100%;
  height: 100%;
  background: ${(props: { $hasBlock: boolean; $blockType?: BlockType }) =>
    props.$hasBlock && props.$blockType
      ? TETRIS_BLOCKS[props.$blockType]?.color || "#666"
      : "#222"};
  border: ${(props: { $hasBlock: boolean }) =>
    props.$hasBlock ? "1px solid #fff" : "none"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
`;

const GameOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  border-radius: 5px;
`;

const PauseOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border-radius: 5px;
`;

const BoardWrapper = styled.div`
  position: relative;
`;

interface GameBoardProps {
  gameState: GameState;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  const renderBoard = () => {
    const boardWithCurrentPiece = gameState.board.map((row) => [...row]);

    // 현재 조각을 보드에 임시로 그리기
    if (gameState.currentPiece) {
      const { shape, position, type } = gameState.currentPiece;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (
              boardY >= 0 &&
              boardY < boardWithCurrentPiece.length &&
              boardX >= 0 &&
              boardX < boardWithCurrentPiece[0].length
            ) {
              boardWithCurrentPiece[boardY][boardX] = type;
            }
          }
        }
      }
    }

    return boardWithCurrentPiece.map((row, y) =>
      row.map((cell, x) => (
        <Cell
          key={`${y}-${x}`}
          $hasBlock={cell !== null}
          $blockType={cell || undefined}
        />
      ))
    );
  };

  return (
    <BoardContainer>
      <BoardWrapper>
        <Board>{renderBoard()}</Board>
        {gameState.gameOver && <GameOverlay>게임 오버! 🐰</GameOverlay>}
        {gameState.isPaused && !gameState.gameOver && (
          <PauseOverlay>일시정지 ⏸️</PauseOverlay>
        )}
      </BoardWrapper>
    </BoardContainer>
  );
};

export default GameBoard;
