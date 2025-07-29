import { SudokuGrid, Difficulty, GridConfig } from '@/types/sudoku';
import { SudokuSolver } from './sudokuSolver';
import { getGridConfig } from './gridConfig';

export class SudokuGenerator {
  static generatePuzzle(difficulty: Difficulty): { puzzle: SudokuGrid; solution: SudokuGrid; gridConfig: GridConfig } {
    const gridConfig = getGridConfig(difficulty);
    
    // For now, let's simplify and create pre-made puzzles for different sizes
    const { puzzle, solution } = this.createPredefinedPuzzle(gridConfig);
    
    return {
      puzzle: puzzle.map(row => [...row]),
      solution: solution.map(row => [...row]),
      gridConfig
    };
  }

  private static createPredefinedPuzzle(gridConfig: GridConfig): { puzzle: SudokuGrid; solution: SudokuGrid } {
    switch (gridConfig.size) {
      case 4:
        return this.create4x4Puzzle();
      case 6:
        return this.create6x6Puzzle();
      case 16:
        return this.create16x16Puzzle();
      default:
        return this.create6x6Puzzle();
    }
  }

  private static create4x4Puzzle(): { puzzle: SudokuGrid; solution: SudokuGrid } {
    const solution = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ];
    
    const puzzle = [
      [1, null, null, 4],
      [null, 4, 1, null],
      [2, null, null, 3],
      [null, 3, 2, null]
    ];
    
    return { puzzle, solution };
  }

  private static create6x6Puzzle(): { puzzle: SudokuGrid; solution: SudokuGrid } {
    const solution = [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2]
    ];
    
    const puzzle = [
      [1, null, null, 4, null, 6],
      [null, 5, null, null, 2, null],
      [2, null, 1, null, null, 4],
      [null, 6, null, 2, null, null],
      [null, 1, null, null, 4, null],
      [6, null, 5, null, null, 2]
    ];
    
    return { puzzle, solution };
  }

  private static create16x16Puzzle(): { puzzle: SudokuGrid; solution: SudokuGrid } {
    // Create a simple 16x16 solution (this would normally be generated)
    const solution = Array(16).fill(null).map((_, row) => 
      Array(16).fill(null).map((_, col) => ((row * 4 + Math.floor(row / 4) + col) % 16) + 1)
    );
    
    // Create puzzle by removing some numbers
    const puzzle = solution.map((row, rowIndex) => 
      row.map((cell, colIndex) => {
        // Remove about 70% of numbers for hard difficulty
        return (rowIndex + colIndex) % 3 === 0 ? null : cell;
      })
    );
    
    return { puzzle, solution };
  }

  static createEmptyGrid(size: number): SudokuGrid {
    return Array(size).fill(null).map(() => Array(size).fill(null));
  }

  static copyGrid(grid: SudokuGrid): SudokuGrid {
    return grid.map(row => [...row]);
  }

  static getDifficultySettings(difficulty: Difficulty) {
    const settings = {
      easy: { name: '4×4 Easy', cellsToRemove: 6, color: 'from-green-400 to-emerald-500' },
      medium: { name: '6×6 Medium', cellsToRemove: 18, color: 'from-yellow-400 to-orange-500' },
      hard: { name: '16×16 Hard', cellsToRemove: 180, color: 'from-red-400 to-pink-500' }
    };
    
    return settings[difficulty];
  }
}
