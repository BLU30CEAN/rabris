import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTetrisGame } from "./hooks/useTetrisGame";
import GameBoard from "./components/GameBoard";
import GameControls from "./components/GameControls";
import GameInfo from "./components/GameInfo";
import { getRandomBlock } from "./utils/tetrisBlocks";

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const GameContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  max-width: 1200px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }
`;

const App: React.FC = () => {
  const {
    gameState,
    movePiece,
    rotateCurrentPiece,
    dropPiece,
    resetGame,
    togglePause,
  } = useTetrisGame();

  const [nextPiece, setNextPiece] = useState<string>("");

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (event.code) {
        case "ArrowLeft":
          event.preventDefault();
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          event.preventDefault();
          movePiece(1, 0);
          break;
        case "ArrowDown":
          event.preventDefault();
          movePiece(0, 1);
          break;
        case "ArrowUp":
        case "Space":
          event.preventDefault();
          rotateCurrentPiece();
          break;
        case "KeyZ":
          event.preventDefault();
          dropPiece();
          break;
        case "KeyP":
          event.preventDefault();
          togglePause();
          break;
        case "KeyR":
          event.preventDefault();
          resetGame();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    gameState.gameOver,
    movePiece,
    rotateCurrentPiece,
    dropPiece,
    togglePause,
    resetGame,
  ]);

  // 다음 블록 업데이트
  useEffect(() => {
    if (!gameState.currentPiece) {
      setNextPiece(getRandomBlock());
    }
  }, [gameState.currentPiece]);

  const gameStats = {
    score: gameState.score,
    level: gameState.level,
    linesCleared: gameState.linesCleared,
  };

  return (
    <AppContainer>
      <GameContainer>
        <GameBoard gameState={gameState} />

        <SidePanel>
          <GameInfo stats={gameStats} nextPiece={nextPiece} />
          <GameControls
            onMoveLeft={() => movePiece(-1, 0)}
            onMoveRight={() => movePiece(1, 0)}
            onMoveDown={() => movePiece(0, 1)}
            onRotate={rotateCurrentPiece}
            onDrop={dropPiece}
            onPause={togglePause}
            onReset={resetGame}
            isPaused={gameState.isPaused}
            gameOver={gameState.gameOver}
          />
        </SidePanel>
      </GameContainer>
    </AppContainer>
  );
};

export default App;
