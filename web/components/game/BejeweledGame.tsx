"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { WalletBar } from "@/components/wallet/WalletBar";
import {
  GRID_SIZE,
  type Board,
  createEmptyBoard,
  generateBoardWithoutMatches,
  isAdjacent,
  swapCells,
  trySwap,
} from "@/lib/game-engine";

const GEM_STYLES = [
  "bg-gradient-to-br from-rose-400 to-rose-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
  "bg-gradient-to-br from-sky-400 to-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
  "bg-gradient-to-br from-emerald-400 to-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
  "bg-gradient-to-br from-amber-300 to-amber-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
  "bg-gradient-to-br from-violet-400 to-purple-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
  "bg-gradient-to-br from-orange-400 to-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
];

const SWIPE_PX = 28;

function cellFromClient(
  root: HTMLElement,
  clientX: number,
  clientY: number,
): { row: number; col: number } | null {
  const rect = root.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
  const col = Math.floor((x / rect.width) * GRID_SIZE);
  const row = Math.floor((y / rect.height) * GRID_SIZE);
  return {
    row: Math.min(GRID_SIZE - 1, Math.max(0, row)),
    col: Math.min(GRID_SIZE - 1, Math.max(0, col)),
  };
}

export function BejeweledGame() {
  /** Deterministic initial grid avoids SSR/client hydration mismatch from `Math.random`. */
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [score, setScore] = useState(0);
  const [lastCombo, setLastCombo] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBoard(generateBoardWithoutMatches());
  }, []);

  const boardRef = useRef<HTMLDivElement>(null);
  const startCell = useRef<{ row: number; col: number } | null>(null);
  const startClient = useRef<{ x: number; y: number } | null>(null);

  const applySwap = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    if (!isAdjacent(r1, c1, r2, c2)) return;

    setBusy(true);
    setBoard((before) => {
      const result = trySwap(before, r1, c1, r2, c2);

      if (!result.valid) {
        window.setTimeout(() => {
          setBoard(before);
          setBusy(false);
        }, 220);
        return swapCells(before, r1, c1, r2, c2);
      }

      setScore((s) => s + result.score);
      setLastCombo(result.rounds);
      window.setTimeout(() => setBusy(false), 120);
      return result.board;
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busy) return;
    const root = boardRef.current;
    if (!root) return;
    const pos = cellFromClient(root, e.clientX, e.clientY);
    if (!pos) return;
    startCell.current = pos;
    startClient.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = startCell.current;
    const sc = startClient.current;
    startCell.current = null;
    startClient.current = null;
    if (!start || !sc) return;

    const dx = e.clientX - sc.x;
    const dy = e.clientY - sc.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < SWIPE_PX && absY < SWIPE_PX) return;

    let nr = start.row;
    let nc = start.col;
    if (absX > absY) {
      nc += dx > 0 ? 1 : -1;
    } else {
      nr += dy > 0 ? 1 : -1;
    }

    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return;
    applySwap(start.row, start.col, nr, nc);
  };

  const newGame = () => {
    if (busy) return;
    setBoard(generateBoardWithoutMatches());
    setScore(0);
    setLastCombo(0);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Bejeweled
        </h1>
        <p className="text-sm text-zinc-400">
          Swipe on a gem to swap with a neighbor. Match 3+ to score.
        </p>
      </header>

      <WalletBar />

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm">
        <div>
          <div className="text-zinc-500">Score</div>
          <div className="font-mono text-lg text-white">{score}</div>
        </div>
        {lastCombo > 1 ? (
          <div className="text-amber-300/90">Combo ×{lastCombo}</div>
        ) : (
          <span className="text-zinc-600">—</span>
        )}
        <button
          type="button"
          onClick={newGame}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
        >
          New game
        </button>
      </div>

      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative mx-auto aspect-square w-full max-w-[min(100vw-2rem,420px)] touch-none select-none rounded-3xl border border-white/10 bg-zinc-900/50 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        style={{ touchAction: "none" }}
      >
        <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-1">
          {board.map((row, r) =>
            row.map((gem, c) => (
              <div
                key={`${r}-${c}`}
                className={`rounded-lg ${GEM_STYLES[gem] ?? GEM_STYLES[0]}`}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}
