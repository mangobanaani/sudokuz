export type SudokuGrid = (number | null)[][];
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GridSize = 4 | 6 | 16;

export interface GridConfig {
  size: GridSize;
  subGridRows: number;
  subGridCols: number;
  maxNumber: number;
}

export interface GameState {
  grid: SudokuGrid;
  solution: SudokuGrid;
  initialGrid: SudokuGrid;
  isComplete: boolean;
  errors: Set<string>;
  selectedCell: { row: number; col: number } | null;
  difficulty: Difficulty;
  gridConfig: GridConfig;
  startTime: number;
  endTime?: number;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: CellPosition[];
}
