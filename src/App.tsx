import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import "./App.css";
import {
  Board,
  CellValue,
  COLS,
  GameState,
  PIECE_COLORS,
  Piece,
  PieceLetter,
  ROWS,
  clearLines,
  collides,
  dropIntervalMs,
  emptyBoard,
  ghostOf,
  levelOf,
  makePiece,
  merge,
  newBag,
  pieceMatrixForPreview,
  scoreFor,
  tryMove,
  tryRotate,
} from "./engine/tetris";

// ─── state ─────────────────────────────────────────────────────────────────
type Action =
  | { type: "tick" }
  | { type: "move"; dx: number }
  | { type: "softDrop" }
  | { type: "hardDrop" }
  | { type: "rotate" }
  | { type: "togglePause" }
  | { type: "start" };

function pull(bag: PieceLetter[]): { piece: Piece; bag: PieceLetter[] } {
  let b = bag;
  if (b.length === 0) b = newBag();
  const piece = makePiece(b[0]);
  return { piece, bag: b.slice(1) };
}

function initialState(): GameState {
  const board = emptyBoard();
  const a = pull(newBag());
  const n = pull(a.bag);
  return {
    board,
    active: a.piece,
    next: n.piece,
    bag: n.bag,
    score: 0,
    level: 1,
    lines: 0,
    status: "ready",
    combo: 0,
  };
}

function lockAndAdvance(state: GameState): GameState {
  const merged = merge(state.active, state.board);
  const { board, cleared } = clearLines(merged);
  const newLines = state.lines + cleared;
  const level = levelOf(newLines);
  const combo = cleared > 0 ? state.combo + 1 : 0;
  const score = state.score + scoreFor(cleared, level, state.combo);

  // Pull next active from `next`, generate new next from bag.
  const active = state.next;
  const pulled = pull(state.bag);

  // If newly spawned piece already collides → game over.
  const gameOver = collides(active, board);

  return {
    ...state,
    board,
    active: gameOver ? state.active : active,
    next: pulled.piece,
    bag: pulled.bag,
    lines: newLines,
    level,
    score,
    combo,
    status: gameOver ? "over" : state.status,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start": {
      const s = initialState();
      return { ...s, status: "playing" };
    }
    case "togglePause": {
      if (state.status === "playing") return { ...state, status: "paused" };
      if (state.status === "paused") return { ...state, status: "playing" };
      return state;
    }
    case "tick": {
      if (state.status !== "playing") return state;
      const moved = tryMove(state.active, state.board, 0, 1);
      if (moved) return { ...state, active: moved };
      return lockAndAdvance(state);
    }
    case "move": {
      if (state.status !== "playing") return state;
      const m = tryMove(state.active, state.board, action.dx, 0);
      return m ? { ...state, active: m } : state;
    }
    case "softDrop": {
      if (state.status !== "playing") return state;
      const m = tryMove(state.active, state.board, 0, 1);
      if (m) return { ...state, active: m, score: state.score + 1 };
      return lockAndAdvance(state);
    }
    case "hardDrop": {
      if (state.status !== "playing") return state;
      const g = ghostOf(state.active, state.board);
      const dropped = g.y - state.active.y;
      const withGhostPos: GameState = {
        ...state,
        active: g,
        score: state.score + dropped * 2,
      };
      return lockAndAdvance(withGhostPos);
    }
    case "rotate": {
      if (state.status !== "playing") return state;
      const r = tryRotate(state.active, state.board);
      return { ...state, active: r };
    }
    default:
      return state;
  }
}

// ─── rendering helpers ─────────────────────────────────────────────────────
function buildVisibleBoard(state: GameState): Board {
  const board: Board = state.board.map((r) => r.slice());

  // ghost piece (preview where active will land)
  if (state.status === "playing") {
    const g = ghostOf(state.active, state.board);
    for (let y = 0; y < g.shape.length; y++)
      for (let x = 0; x < g.shape[y].length; x++) {
        if (!g.shape[y][x]) continue;
        const bx = g.x + x;
        const by = g.y + y;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS && !board[by][bx]) {
          board[by][bx] = "G";
        }
      }
  }

  // active piece (on top of ghost)
  for (let y = 0; y < state.active.shape.length; y++)
    for (let x = 0; x < state.active.shape[y].length; x++) {
      if (!state.active.shape[y][x]) continue;
      const bx = state.active.x + x;
      const by = state.active.y + y;
      if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
        board[by][bx] = state.active.letter;
      }
    }
  return board;
}

function cellStyle(value: CellValue, ghostLetter?: PieceLetter): React.CSSProperties {
  if (!value) return {};
  if (value === "G") {
    const c = ghostLetter ? PIECE_COLORS[ghostLetter] : "#94a3b8";
    return {
      background: "transparent",
      boxShadow: `inset 0 0 0 2px ${c}55`,
      borderRadius: 4,
    };
  }
  return { background: PIECE_COLORS[value as PieceLetter] };
}

// ─── App component ────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const visible = useMemo(() => buildVisibleBoard(state), [state]);

  // Auto-fall — interval that reads the latest state via ref.
  useEffect(() => {
    if (state.status !== "playing") return;
    const ms = dropIntervalMs(state.level);
    const id = window.setInterval(() => dispatch({ type: "tick" }), ms);
    return () => window.clearInterval(id);
  }, [state.status, state.level]);

  // Keyboard — register once.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stateRef.current.status === "over") {
        if (e.key === "Enter" || e.key === " ") dispatch({ type: "start" });
        return;
      }
      switch (e.key) {
        case "ArrowLeft":
          dispatch({ type: "move", dx: -1 });
          e.preventDefault();
          break;
        case "ArrowRight":
          dispatch({ type: "move", dx: 1 });
          e.preventDefault();
          break;
        case "ArrowDown":
          dispatch({ type: "softDrop" });
          e.preventDefault();
          break;
        case "ArrowUp":
        case "x":
        case "X":
          dispatch({ type: "rotate" });
          e.preventDefault();
          break;
        case " ":
          dispatch({ type: "hardDrop" });
          e.preventDefault();
          break;
        case "p":
        case "P":
          dispatch({ type: "togglePause" });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nextMatrix = useMemo(() => pieceMatrixForPreview(state.next.letter), [state.next.letter]);
  const ghostLetterForVisible = state.active.letter;

  const onStart = useCallback(() => dispatch({ type: "start" }), []);
  const onPause = useCallback(() => dispatch({ type: "togglePause" }), []);

  return (
    <div className="rabris">
      <div className="frame">
        <aside className="side left">
          <div className="brand">
            <span className="brand-dot" />
            <span className="brand-name">rabris</span>
            <span className="brand-tag">v0.3</span>
          </div>
          <Stat label="SCORE" value={state.score.toLocaleString()} />
          <Stat label="LEVEL" value={String(state.level)} />
          <Stat label="LINES" value={String(state.lines)} />

          <div className="actions">
            {state.status === "ready" && (
              <button className="btn primary" onClick={onStart}>start</button>
            )}
            {(state.status === "playing" || state.status === "paused") && (
              <button className="btn" onClick={onPause}>
                {state.status === "paused" ? "resume" : "pause"}
              </button>
            )}
            {state.status === "over" && (
              <button className="btn primary" onClick={onStart}>new game</button>
            )}
          </div>
        </aside>

        <div className="board-wrap">
          <div className="board" aria-label="tetris board">
            {visible.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`cell ${cell ? "filled" : ""}`}
                  style={cellStyle(cell, ghostLetterForVisible)}
                />
              )),
            )}
            {state.status === "paused" && <div className="overlay">paused</div>}
            {state.status === "over" && (
              <div className="overlay">
                <div className="overlay-title">game over</div>
                <div className="overlay-sub">press enter</div>
              </div>
            )}
          </div>
        </div>

        <aside className="side right">
          <div className="preview-card">
            <div className="preview-label">NEXT</div>
            <div className="preview">
              {nextMatrix.map((row, y) =>
                row.map((v, x) => (
                  <div
                    key={`p-${y}-${x}`}
                    className="cell preview-cell"
                    style={v ? { background: PIECE_COLORS[state.next.letter] } : undefined}
                  />
                )),
              )}
            </div>
          </div>

          <div className="legend">
            <div><kbd>←</kbd><kbd>→</kbd> move</div>
            <div><kbd>↑</kbd> rotate</div>
            <div><kbd>↓</kbd> soft drop</div>
            <div><kbd>space</kbd> hard drop</div>
            <div><kbd>p</kbd> pause</div>
          </div>

          <Touchpad
            disabled={state.status !== "playing"}
            onLeft={() => dispatch({ type: "move", dx: -1 })}
            onRight={() => dispatch({ type: "move", dx: 1 })}
            onRotate={() => dispatch({ type: "rotate" })}
            onSoft={() => dispatch({ type: "softDrop" })}
            onHard={() => dispatch({ type: "hardDrop" })}
          />
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function Touchpad({
  disabled,
  onLeft,
  onRight,
  onRotate,
  onSoft,
  onHard,
}: {
  disabled: boolean;
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoft: () => void;
  onHard: () => void;
}) {
  // Hidden on desktop via CSS; surfaces on touch viewports.
  return (
    <div className={`touchpad ${disabled ? "disabled" : ""}`} aria-hidden={disabled}>
      <button className="tp tp-rot" onClick={onRotate} aria-label="rotate">↻</button>
      <button className="tp tp-left" onClick={onLeft} aria-label="left">←</button>
      <button className="tp tp-right" onClick={onRight} aria-label="right">→</button>
      <button className="tp tp-soft" onClick={onSoft} aria-label="soft drop">↓</button>
      <button className="tp tp-hard" onClick={onHard} aria-label="hard drop">⤓</button>
    </div>
  );
}
