import React from "react";
import styled from "styled-components";
import { soundManager } from "../utils/soundManager";

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DirectionalButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 5px;
  max-width: 150px;
  margin: 0 auto;
`;

const ControlButton = styled.button`
  padding: 12px 16px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #4caf50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #45a049;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 14px;
  }
`;

const RotateButton = styled(ControlButton)`
  background: #2196f3;

  &:hover {
    background: #1976d2;
  }
`;

const DropButton = styled(ControlButton)`
  background: #ff9800;

  &:hover {
    background: #f57c00;
  }
`;

const GameButton = styled(ControlButton)`
  background: #9c27b0;

  &:hover {
    background: #7b1fa2;
  }
`;

const PauseButton = styled(ControlButton)`
  background: #607d8b;

  &:hover {
    background: #455a64;
  }
`;

const ResetButton = styled(ControlButton)`
  background: #f44336;

  &:hover {
    background: #d32f2f;
  }
`;

const SoundButton = styled(ControlButton)`
  background: #ff5722;

  &:hover {
    background: #e64a19;
  }
`;

const LeftButton = styled(ControlButton)`
  grid-column: 1;
  grid-row: 2;
`;

const DownButton = styled(ControlButton)`
  grid-column: 2;
  grid-row: 3;
`;

const RightButton = styled(ControlButton)`
  grid-column: 3;
  grid-row: 2;
`;

const UpButton = styled(ControlButton)`
  grid-column: 2;
  grid-row: 1;
`;

interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onDrop: () => void;
  onPause: () => void;
  onReset: () => void;
  isPaused: boolean;
  gameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onDrop,
  onPause,
  onReset,
  isPaused,
  gameOver,
}) => {
  return (
    <ControlsContainer>
      <ButtonGroup>
        <DirectionalButtons>
          <UpButton onClick={onRotate} disabled={gameOver}>
            🔄
          </UpButton>
          <LeftButton onClick={onMoveLeft} disabled={gameOver}>
            ⬅️
          </LeftButton>
          <DownButton onClick={onMoveDown} disabled={gameOver}>
            ⬇️
          </DownButton>
          <RightButton onClick={onMoveRight} disabled={gameOver}>
            ➡️
          </RightButton>
        </DirectionalButtons>
      </ButtonGroup>

      <ButtonGroup>
        <DropButton onClick={onDrop} disabled={gameOver}>
          🚀 빠른 낙하
        </DropButton>
        <RotateButton onClick={onRotate} disabled={gameOver}>
          🔄 회전
        </RotateButton>
      </ButtonGroup>

      <ButtonGroup>
        <PauseButton onClick={onPause} disabled={gameOver}>
          {isPaused ? "▶️ 재개" : "⏸️ 일시정지"}
        </PauseButton>
        <ResetButton onClick={onReset}>🐰 새 게임</ResetButton>
        <SoundButton onClick={() => soundManager.toggleMute()}>
          {soundManager.isSoundMuted() ? "🔇 사운드 켜기" : "🔊 사운드 끄기"}
        </SoundButton>
      </ButtonGroup>
    </ControlsContainer>
  );
};

export default GameControls;
