'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GameState, Difficulty, SudokuGrid } from '@/types/sudoku';
import { SudokuGenerator } from '@/utils/sudokuGenerator';
import { SudokuSolver } from '@/utils/sudokuSolver';

interface SudokuContextType {
  gameState: GameState;
  newGame: (difficulty: Difficulty) => void;
  makeMove: (row: number, col: number, value: number | null) => void;
  selectCell: (row: number, col: number) => void;
  solvePuzzle: () => void;
  getHint: () => void;
  resetGame: () => void;
  // Performance helpers
  isInitialCell: (row: number, col: number) => boolean;
  hasError: (row: number, col: number) => boolean;
  isSelected: (row: number, col: number) => boolean;
  elapsedTime: number;
  progress: number;
}

const SudokuContext = React.createContext<SudokuContextType | undefined>(undefined);

const createInitialState = (): GameState => {
  // Create empty state for SSR to prevent hydration mismatch
  const emptyGrid = Array(6).fill(null).map(() => Array(6).fill(null)); // Default 6x6
  const defaultConfig = {
    size: 6 as const,
    subGridRows: 2,
    subGridCols: 3,
    maxNumber: 6,
  };
  
  return {
    grid: emptyGrid,
    solution: emptyGrid,
    initialGrid: emptyGrid,
    isComplete: false,
    errors: new Set(),
    selectedCell: null,
    difficulty: 'medium',
    gridConfig: defaultConfig,
    startTime: Date.now(),
  };
};

export function SudokuProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Prevent hydration mismatch by only calculating time after mount
  useEffect(() => {
    setMounted(true);
    // Generate initial puzzle after mount to prevent hydration mismatch
    const { puzzle, solution, gridConfig } = SudokuGenerator.generatePuzzle('medium');
    const startTime = Date.now();
    setCurrentTime(startTime);
    setGameState({
      grid: puzzle,
      solution,
      initialGrid: SudokuGenerator.copyGrid(puzzle),
      isComplete: false,
      errors: new Set(),
      selectedCell: null,
      difficulty: 'medium',
      gridConfig,
      startTime,
    });
  }, []);

  // Update current time every second for real-time elapsed time
  useEffect(() => {
    if (!mounted || gameState.isComplete) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, gameState.isComplete]);

  const newGame = useCallback((difficulty: Difficulty) => {
    const { puzzle, solution, gridConfig } = SudokuGenerator.generatePuzzle(difficulty);
    const startTime = Date.now();
    setCurrentTime(startTime);
    setGameState({
      grid: puzzle,
      solution,
      initialGrid: SudokuGenerator.copyGrid(puzzle),
      isComplete: false,
      errors: new Set(),
      selectedCell: null,
      difficulty,
      gridConfig,
      startTime,
    });
  }, []);

  const makeMove = useCallback((row: number, col: number, value: number | null) => {
    setGameState(prev => {
      // Don't allow moves on initial cells
      if (prev.initialGrid[row][col] !== null) return prev;

      // Clone grid efficiently
      const newGrid = prev.grid.map((r, rowIndex) => 
        rowIndex === row ? r.map((cell, colIndex) => 
          colIndex === col ? value : cell
        ) : [...r]
      );

      // Validate move with optimized conflict detection
      const validation = SudokuSolver.validateGrid(newGrid, prev.gridConfig);
      const newErrors = new Set(
        validation.conflicts.map(({ row: r, col: c }) => `${r}-${c}`)
      );

      const isComplete = SudokuSolver.isComplete(newGrid, prev.gridConfig);

      return {
        ...prev,
        grid: newGrid,
        errors: newErrors,
        isComplete,
        endTime: isComplete ? Date.now() : prev.endTime,
      };
    });
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col }
    }));
  }, []);

  const solvePuzzle = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      grid: SudokuGenerator.copyGrid(prev.solution),
      errors: new Set(),
      isComplete: true,
      endTime: Date.now(),
    }));
  }, []);

  const getHint = useCallback(() => {
    setGameState(prev => {
      const hint = SudokuSolver.getHint(prev.grid, prev.solution, prev.gridConfig);
      if (!hint) return prev;

      // Clone grid with hint applied
      const newGrid = prev.grid.map((r, rowIndex) => 
        rowIndex === hint.row ? r.map((cell, colIndex) => 
          colIndex === hint.col ? prev.solution[hint.row][hint.col] : cell
        ) : [...r]
      );

      const validation = SudokuSolver.validateGrid(newGrid, prev.gridConfig);
      const newErrors = new Set(
        validation.conflicts.map(({ row: r, col: c }) => `${r}-${c}`)
      );

      const isComplete = SudokuSolver.isComplete(newGrid, prev.gridConfig);

      return {
        ...prev,
        grid: newGrid,
        errors: newErrors,
        isComplete,
        selectedCell: hint,
        endTime: isComplete ? Date.now() : prev.endTime,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    const startTime = Date.now();
    setCurrentTime(startTime);
    setGameState(prev => ({
      ...prev,
      grid: SudokuGenerator.copyGrid(prev.initialGrid),
      errors: new Set(),
      isComplete: false,
      selectedCell: null,
      startTime,
      endTime: undefined,
    }));
  }, []);

  // Memoized helper functions for performance
  const isInitialCell = useCallback((row: number, col: number) => {
    return gameState.initialGrid[row][col] !== null;
  }, [gameState.initialGrid]);

  const hasError = useCallback((row: number, col: number) => {
    return gameState.errors.has(`${row}-${col}`);
  }, [gameState.errors]);

  const isSelected = useCallback((row: number, col: number) => {
    return gameState.selectedCell?.row === row && gameState.selectedCell?.col === col;
  }, [gameState.selectedCell]);

  // Memoized computed values
  const elapsedTime = useMemo(() => {
    if (!mounted) return 0; // Return 0 during SSR to prevent hydration mismatch
    const endTime = gameState.endTime || currentTime;
    return Math.floor((endTime - gameState.startTime) / 1000);
  }, [gameState.startTime, gameState.endTime, mounted, currentTime]);

  const progress = useMemo(() => {
    const filledCells = gameState.grid.flat().filter(cell => cell !== null).length;
    const totalCells = gameState.gridConfig.size * gameState.gridConfig.size;
    return Math.round((filledCells / totalCells) * 100);
  }, [gameState.grid, gameState.gridConfig]);

  const value: SudokuContextType = useMemo(() => ({
    gameState,
    newGame,
    makeMove,
    selectCell,
    solvePuzzle,
    getHint,
    resetGame,
    isInitialCell,
    hasError,
    isSelected,
    elapsedTime,
    progress,
  }), [
    gameState,
    newGame,
    makeMove,
    selectCell,
    solvePuzzle,
    getHint,
    resetGame,
    isInitialCell,
    hasError,
    isSelected,
    elapsedTime,
    progress,
  ]);

  return (
    <SudokuContext.Provider value={value}>
      {children}
    </SudokuContext.Provider>
  );
}

export function useSudoku() {
  const context = React.useContext(SudokuContext);
  if (context === undefined) {
    throw new Error('useSudoku must be used within a SudokuProvider');
  }
  return context;
}
