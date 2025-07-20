import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { TetrisState, Piece } from './types/tetris';

// 테트리스 블록 정의 (일반적인 테트리스 색상)
const TETROMINOS: { [key: string]: { shape: number[][]; color: string; emoji: string } } = {
  0: { shape: [[0]], color: '0, 0, 0', emoji: '' },
  I: {
    shape: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    color: '0, 240, 240',
    emoji: ''
  },
  J: {
    shape: [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    color: '0, 0, 240',
    emoji: ''
  },
  L: {
    shape: [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    color: '240, 160, 0',
    emoji: ''
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: '240, 240, 0',
    emoji: ''
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    color: '0, 240, 0',
    emoji: ''
  },
  T: {
    shape: [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    color: '160, 0, 240',
    emoji: ''
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    color: '240, 0, 0',
    emoji: ''
  },
};

// 블록 타입을 숫자로 매핑
const BLOCK_TYPES = {
  I: 1,
  J: 2,
  L: 3,
  O: 4,
  S: 5,
  T: 6,
  Z: 7
};

// 랜덤 블록 생성
const randomTetromino = (): { shape: number[][]; color: string; emoji: string } => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};

const App: React.FC = () => {
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
  });
  const [nextTetromino, setNextTetromino] = useState(randomTetromino());
  const [stage, setStage] = useState(createBoard());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);

  // 게임 보드 생성
  function createBoard(): [number, string][][] {
    return Array.from(Array(20), () => new Array(12).fill([0, 'clear']));
  }

  // 충돌 감지
  const checkCollision = (player: any, stage: [number, string][][], { x: moveX, y: moveY }: { x: number; y: number }): boolean => {
    for (let y = 0; y < player.tetromino.length; y += 1) {
      for (let x = 0; x < player.tetromino[y].length; x += 1) {
        if (player.tetromino[y][x] !== 0) {
          if (
            !stage[y + player.pos.y + moveY] ||
            !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
            stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // 플레이어 이동
  const movePlayer = (dir: { x: number; y: number }): void => {
    if (!checkCollision(player, stage, dir)) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x + dir.x, y: prev.pos.y + dir.y }
      }));
    }
  };

  // 블록 회전
  const rotate = (matrix: number[][], dir: number): number[][] => {
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    if (dir > 0) return rotatedTetro.map(row => row.reverse());
    return rotatedTetro.reverse();
  };

  const playerRotate = (): void => {
    const rotated = rotate(player.tetromino, 1);
    let offset = 1;
    while (checkCollision({ ...player, tetromino: rotated }, stage, { x: 0, y: 0 })) {
      rotated.forEach((_, index) => {
        rotated[index] = rotated[index].map((_, index2) => rotated[index][index2] === 0 && rotated[index][index2 + 1] !== 0 ? rotated[index][index2 + 1] : rotated[index][index2]);
      });
      offset += 1;
      if (offset > rotated[0].length) {
        return;
      }
    }
    setPlayer(prev => ({
      ...prev,
      tetromino: rotated
    }));
  };

  // 빠른 낙하 (즉시 하강) - 수정됨
  const dropPlayer = (): void => {
    let dropDistance = 0;
    while (!checkCollision(player, stage, { x: 0, y: dropDistance + 1 })) {
      dropDistance += 1;
    }
    movePlayer({ x: 0, y: dropDistance });
  };

  // 블록 고정
  const drop = useCallback((): void => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      movePlayer({ x: 0, y: 1 });
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        return;
      }
      setPlayer(prev => ({
        ...prev,
        collided: true
      }));
    }
  }, [player, stage]);

  // 라인 제거
  const sweepRows = useCallback((newStage: [number, string][][]): [number, string][][] => {
    return newStage.reduce((acc, row) => {
      if (row.findIndex(cell => cell[0] === 0) === -1) {
        setLines(prev => prev + 1);
        setScore(prev => prev + 100 * level);
        acc.unshift(new Array(newStage[0].length).fill([0, 'clear']));
        return acc;
      }
      acc.push(row);
      return acc;
    }, [] as [number, string][][]);
  }, [level]);

  // 새 블록 생성
  const startGame = (): void => {
    const newStage = createBoard();
    setStage(newStage);
    setDropTime(1000);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    const firstTetromino = randomTetromino();
    setPlayer({
      pos: { x: 4, y: 0 },
      tetromino: firstTetromino.shape,
      collided: false,
    });
    setNextTetromino(randomTetromino());
    
    // 게임 시작 시 첫 번째 블록을 보드에 표시
    const updatedStage = newStage.map(row => [...row]);
    firstTetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          updatedStage[y + 0][x + 4] = [1, 'clear'];
        }
      });
    });
    setStage(updatedStage);
  };

  // 키보드 이벤트
  const move = useCallback(({ keyCode }: { keyCode: number }) => {
    if (!gameOver) {
      if (keyCode === 37) {
        movePlayer({ x: -1, y: 0 });
      } else if (keyCode === 39) {
        movePlayer({ x: 1, y: 0 });
      } else if (keyCode === 40) {
        drop();
      } else if (keyCode === 38) {
        playerRotate();
      } else if (keyCode === 32) {
        dropPlayer(); // 스페이스바로 즉시 하강
      }
    }
  }, [gameOver, drop, dropPlayer, movePlayer, playerRotate]);

  useEffect(() => {
    document.addEventListener('keydown', move);
    return () => {
      document.removeEventListener('keydown', move);
    };
  }, [move]);

  // 자동 낙하
  useEffect(() => {
    if (dropTime) {
      const interval = setInterval(() => {
        drop();
      }, dropTime);
      return () => {
        clearInterval(interval);
      };
    }
  }, [dropTime, drop]);

  // 블록 고정 후 처리
  useEffect(() => {
    if (player.collided) {
      const newStage = stage.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] as [number, string] : cell))
      );

      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newStage[y + player.pos.y][x + player.pos.x] = [
              value,
              `${player.collided ? 'merged' : 'clear'}`,
            ] as [number, string];
          }
        });
      });

      if (player.collided) {
        const newStage2 = sweepRows(newStage);
        setStage(newStage2);
        const newTetromino = randomTetromino();
        setPlayer({
          pos: { x: 4, y: 0 },
          tetromino: newTetromino.shape,
          collided: false,
        });
        setNextTetromino(randomTetromino());
        
        // 새 블록을 보드에 표시
        const updatedStage = newStage2.map(row => [...row]);
        newTetromino.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              updatedStage[y + 0][x + 4] = [1, 'clear'];
            }
          });
        });
        setStage(updatedStage);
      }
    }
  }, [player, stage, nextTetromino, sweepRows]);

  // 레벨 업
  useEffect(() => {
    if (lines > level * 10) {
      setLevel(prev => prev + 1);
      setDropTime(1000 / level);
    }
  }, [lines, level]);

  return (
    <div className="App">
      <div className="game-container">
        <div className="game-info">
          <h1>🐰 토끼 테트리스 🥕</h1>
          <div className="score-board">
            <div>🥕 점수: {score}</div>
            <div>📊 레벨: {level}</div>
            <div>📈 라인: {lines}</div>
          </div>
          <button className="start-button" onClick={startGame}>
            {gameOver ? '게임 오버 - 다시 시작' : '게임 시작'}
          </button>
        </div>
        
        <div className="game-board">
          <div className="stage">
            {stage.map((row, y) =>
              row.map((cell, x) => {
                // 현재 플레이어 블록이 있는 위치인지 확인
                const isPlayerBlock = player.tetromino.some((tetroRow, ty) =>
                  tetroRow.some((tetroCell, tx) => 
                    tetroCell !== 0 && 
                    y === player.pos.y + ty && 
                    x === player.pos.x + tx
                  )
                );
                
                return (
                  <Cell 
                    key={`${y}-${x}`} 
                    type={isPlayerBlock ? 1 : cell[0]} 
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="next-piece">
          <h3>다음 블록:</h3>
          <div className="next-stage">
            {nextTetromino.shape.map((row, y) =>
              row.map((cell, x) => (
                <NextCell key={`next-${y}-${x}`} type={cell} tetromino={nextTetromino} />
              ))
            )}
          </div>
          
          <div className="game-controls">
            <h4>게임 컨트롤</h4>
            <div className="gamepad-layout">
              <div className="d-pad">
                <button 
                  className="control-btn up-btn"
                  onClick={() => playerRotate()}
                  disabled={gameOver}
                >
                  ↑
                </button>
                <div className="d-pad-middle">
                  <button 
                    className="control-btn left-btn"
                    onClick={() => movePlayer({ x: -1, y: 0 })}
                    disabled={gameOver}
                  >
                    ←
                  </button>
                  <button 
                    className="control-btn right-btn"
                    onClick={() => movePlayer({ x: 1, y: 0 })}
                    disabled={gameOver}
                  >
                    →
                  </button>
                </div>
                <button 
                  className="control-btn down-btn"
                  onClick={() => drop()}
                  disabled={gameOver}
                >
                  ↓
                </button>
              </div>
              <div className="action-buttons">
                <button 
                  className="control-btn action-btn"
                  onClick={() => dropPlayer()}
                  disabled={gameOver}
                >
                  A
                </button>
                <button 
                  className="control-btn action-btn"
                  onClick={() => playerRotate()}
                  disabled={gameOver}
                >
                  B
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 셀 컴포넌트
const Cell: React.FC<{ type: number }> = ({ type }) => {
  const color = TETROMINOS[type] ? TETROMINOS[type].color : '0, 0, 0';
  
  return (
    <div
      className="cell"
      style={{
        backgroundColor: type !== 0 ? `rgb(${color})` : 'transparent',
        border: type === 0 ? '0px solid' : '2px solid',
        borderColor: type !== 0 ? `rgb(${color})` : 'transparent',
        boxShadow: type !== 0 ? 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.3)' : 'none',
      }}
    />
  );
};

// 다음 블록 셀 컴포넌트
const NextCell: React.FC<{ type: number; tetromino: { shape: number[][]; color: string; emoji: string } }> = ({ type, tetromino }) => {
  const color = type !== 0 ? tetromino.color : '0, 0, 0';
  
  return (
    <div
      className="next-cell"
      style={{
        backgroundColor: type !== 0 ? `rgb(${color})` : 'transparent',
        border: type === 0 ? '0px solid' : '1px solid',
        borderColor: type !== 0 ? `rgb(${color})` : 'transparent',
        boxShadow: type !== 0 ? 'inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.3)' : 'none',
      }}
    />
  );
};

export default App; 