import React from "react";
import styled from "styled-components";
import { GameStats } from "../types/TetrisTypes";

const InfoContainer = styled.div`
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

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const InfoLabel = styled.span`
  font-weight: bold;
  color: #333;
  font-size: 14px;
`;

const InfoValue = styled.span`
  font-weight: bold;
  color: #2196f3;
  font-size: 18px;
  font-family: "Courier New", monospace;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin: 0 0 15px 0;
  font-size: 20px;
`;

const NextPieceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NextPieceLabel = styled.span`
  font-weight: bold;
  color: #333;
  font-size: 14px;
`;

const NextPieceDisplay = styled.div`
  width: 60px;
  height: 60px;
  background: #333;
  border: 2px solid #666;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
`;

interface GameInfoProps {
  stats: GameStats;
  nextPiece?: string;
}

const GameInfo: React.FC<GameInfoProps> = ({ stats, nextPiece }) => {
  return (
    <InfoContainer>
      <Title>🐰RABRIS🐰 </Title>

      <InfoItem>
        <InfoLabel>점수</InfoLabel>
        <InfoValue>{stats.score.toLocaleString()}</InfoValue>
      </InfoItem>

      <InfoItem>
        <InfoLabel>레벨</InfoLabel>
        <InfoValue>{stats.level}</InfoValue>
      </InfoItem>

      <InfoItem>
        <InfoLabel>줄 제거</InfoLabel>
        <InfoValue>{stats.linesCleared}</InfoValue>
      </InfoItem>

      <NextPieceContainer>
        <NextPieceLabel>다음 블록</NextPieceLabel>
        <NextPieceDisplay>{nextPiece ? "●" : "?"}</NextPieceDisplay>
      </NextPieceContainer>
    </InfoContainer>
  );
};

export default GameInfo;
