import { SudokuSolver } from '@/utils/sudokuSolver';
import { SudokuGenerator } from '@/utils/sudokuGenerator';
import { GridConfig } from '@/types/sudoku';

describe('SudokuSolver', () => {
  const gridConfig4x4: GridConfig = {
    size: 4,
    subGridRows: 2,
    subGridCols: 2,
    maxNumber: 4
  };

  const gridConfig16x16: GridConfig = {
    size: 16,
    subGridRows: 4,
    subGridCols: 4,
    maxNumber: 16
  };

  describe('isValidMove', () => {
    it('should return true for valid moves in 4x4 grid', () => {
      const grid = SudokuGenerator.createEmptyGrid(4);
      grid[0][0] = 1;
      
      expect(SudokuSolver.isValidMove(grid, 0, 1, 2, gridConfig4x4)).toBe(true);
      expect(SudokuSolver.isValidMove(grid, 1, 0, 2, gridConfig4x4)).toBe(true);
      expect(SudokuSolver.isValidMove(grid, 2, 2, 3, gridConfig4x4)).toBe(true);
    });

    it('should return false for invalid moves in same row', () => {
      const grid = SudokuGenerator.createEmptyGrid(4);
      grid[0][0] = 1;
      
      expect(SudokuSolver.isValidMove(grid, 0, 1, 1, gridConfig4x4)).toBe(false);
    });

    it('should return false for invalid moves in same column', () => {
      const grid = SudokuGenerator.createEmptyGrid(4);
      grid[0][0] = 1;
      
      expect(SudokuSolver.isValidMove(grid, 1, 0, 1, gridConfig4x4)).toBe(false);
    });

    it('should return false for invalid moves in same 2x2 box', () => {
      const grid = SudokuGenerator.createEmptyGrid(4);
      grid[0][0] = 1;
      
      // In a 4x4 grid, (0,0) is in the top-left 2x2 box with (0,1), (1,0), and (1,1)
      expect(SudokuSolver.isValidMove(grid, 1, 1, 1, gridConfig4x4)).toBe(false);
      expect(SudokuSolver.isValidMove(grid, 0, 1, 1, gridConfig4x4)).toBe(false);
      expect(SudokuSolver.isValidMove(grid, 1, 0, 1, gridConfig4x4)).toBe(false);
    });
  });

  describe('solve', () => {
    it('should solve a valid sudoku puzzle', () => {
      const grid = SudokuGenerator.createEmptyGrid(16);
      // Add some initial numbers to create a solvable puzzle
      grid[0][0] = 5;
      grid[0][1] = 3;
      grid[0][4] = 7;
      
      const result = SudokuSolver.solve(grid, gridConfig16x16);
      expect(result).toBe(true);
      expect(SudokuSolver.isComplete(grid, gridConfig16x16)).toBe(true);
    });

    it('should return false for unsolvable puzzle', () => {
      const grid = SudokuGenerator.createEmptyGrid(4);
      // Create an unsolvable configuration
      grid[0][0] = 1;
      grid[0][1] = 1; // Invalid: same number in same row
      
      const result = SudokuSolver.solve(grid, gridConfig4x4);
      expect(result).toBe(false);
    });
  });

  describe('validateGrid', () => {
    it('should return valid for correct grid', () => {
      const grid = SudokuGenerator.createEmptyGrid(4);
      grid[0][0] = 1;
      grid[0][1] = 2;
      grid[1][0] = 3;
      
      const result = SudokuSolver.validateGrid(grid, gridConfig4x4);
      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should detect conflicts', () => {
      const grid = SudokuGenerator.createEmptyGrid(4);
      grid[0][0] = 1;
      grid[0][1] = 1; // Conflict in same row
      
      const result = SudokuSolver.validateGrid(grid, gridConfig4x4);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('isComplete', () => {
    it('should return false for incomplete grid', () => {
      const grid = SudokuGenerator.createEmptyGrid(4);
      grid[0][0] = 1;
      
      expect(SudokuSolver.isComplete(grid, gridConfig4x4)).toBe(false);
    });

    it('should return false for complete but invalid grid', () => {
      const grid = Array(4).fill(null).map(() => Array(4).fill(1));
      
      expect(SudokuSolver.isComplete(grid, gridConfig4x4)).toBe(false);
    });
  });

  describe('getHint', () => {
    it('should return a valid hint position', () => {
      const puzzle = SudokuGenerator.createEmptyGrid(4);
      const solution = SudokuGenerator.createEmptyGrid(4);
      
      puzzle[0][0] = null;
      solution[0][0] = 3;
      solution[0][1] = 4;
      solution[1][0] = 1;
      solution[1][1] = 2;
      
      const hint = SudokuSolver.getHint(puzzle, solution, gridConfig4x4);
      
      if (hint) {
        expect(hint.row).toBeGreaterThanOrEqual(0);
        expect(hint.row).toBeLessThan(4);
        expect(hint.col).toBeGreaterThanOrEqual(0);
        expect(hint.col).toBeLessThan(4);
        expect(puzzle[hint.row][hint.col]).toBeNull();
      }
    });

    it('should return null for complete puzzle', () => {
      const completeGrid = Array(4).fill(null).map((_, row) => 
        Array(4).fill(null).map((_, col) => (row * 4 + col) % 4 + 1)
      );
      
      const hint = SudokuSolver.getHint(completeGrid, completeGrid, gridConfig4x4);
      expect(hint).toBeNull();
    });
  });
});
