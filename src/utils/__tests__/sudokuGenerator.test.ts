import { SudokuGenerator } from '@/utils/sudokuGenerator';
import { SudokuSolver } from '@/utils/sudokuSolver';
import { getGridConfig } from '@/utils/gridConfig';

describe('SudokuGenerator', () => {
  describe('createEmptyGrid', () => {
    it('should create grids of different sizes', () => {
      // Test 4x4 grid
      const grid4x4 = SudokuGenerator.createEmptyGrid(4);
      expect(grid4x4).toHaveLength(4);
      expect(grid4x4[0]).toHaveLength(4);
      
      // Test 6x6 grid
      const grid6x6 = SudokuGenerator.createEmptyGrid(6);
      expect(grid6x6).toHaveLength(6);
      expect(grid6x6[0]).toHaveLength(6);
      
      // Test 16x16 grid
      const grid16x16 = SudokuGenerator.createEmptyGrid(16);
      expect(grid16x16).toHaveLength(16);
      expect(grid16x16[0]).toHaveLength(16);
      
      // Check all cells are null
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          expect(grid4x4[row][col]).toBeNull();
        }
      }
    });
  });

  describe('copyGrid', () => {
    it('should create a deep copy of the grid', () => {
      const original = SudokuGenerator.createEmptyGrid(4);
      original[0][0] = 5;
      original[1][1] = 7;
      
      const copy = SudokuGenerator.copyGrid(original);
      
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      expect(copy[0]).not.toBe(original[0]);
      
      // Modifying copy shouldn't affect original
      copy[0][0] = 9;
      expect(original[0][0]).toBe(5);
    });
  });

  describe('generatePuzzle', () => {
    it('should generate a valid puzzle for each difficulty', () => {
      const difficulties = ['easy', 'medium', 'hard'] as const;
      
      difficulties.forEach(difficulty => {
        const { puzzle, solution } = SudokuGenerator.generatePuzzle(difficulty);
        const config = getGridConfig(difficulty);
        
        // Check grid dimensions
        expect(puzzle).toHaveLength(config.size);
        expect(solution).toHaveLength(config.size);
        expect(puzzle[0]).toHaveLength(config.size);
        expect(solution[0]).toHaveLength(config.size);
        
        // Solution should be complete and valid
        expect(SudokuSolver.isComplete(solution, config)).toBe(true);
        
        // Puzzle should be valid (no conflicts)
        const validation = SudokuSolver.validateGrid(puzzle, config);
        expect(validation.isValid).toBe(true);
        
        // Puzzle should have some empty cells
        let emptyCells = 0;
        for (let row = 0; row < config.size; row++) {
          for (let col = 0; col < config.size; col++) {
            if (puzzle[row][col] === null) {
              emptyCells++;
            }
          }
        }
        expect(emptyCells).toBeGreaterThan(0);
        
        // All filled cells in puzzle should match solution
        for (let row = 0; row < config.size; row++) {
          for (let col = 0; col < config.size; col++) {
            if (puzzle[row][col] !== null) {
              expect(puzzle[row][col]).toBe(solution[row][col]);
            }
          }
        }
      });
    });

    it('should generate puzzles with appropriate difficulty', () => {
      const { puzzle: easy } = SudokuGenerator.generatePuzzle('easy');
      const { puzzle: hard } = SudokuGenerator.generatePuzzle('hard');
      
      const countEmptyCells = (grid: any, size: number) => {
        let count = 0;
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            if (grid[row][col] === null) count++;
          }
        }
        return count;
      };
      
      const easyEmpty = countEmptyCells(easy, 4);
      const hardEmpty = countEmptyCells(hard, 16);
      
      // Both should have some empty cells
      expect(easyEmpty).toBeGreaterThan(0);
      expect(hardEmpty).toBeGreaterThan(0);
    });
  });

  describe('getDifficultySettings', () => {
    it('should return correct settings for each difficulty', () => {
      const easy = SudokuGenerator.getDifficultySettings('easy');
      expect(easy.name).toBe('4×4 Easy');
      expect(easy.cellsToRemove).toBe(6);
      expect(easy.color).toContain('green');
      
      const medium = SudokuGenerator.getDifficultySettings('medium');
      expect(medium.name).toBe('6×6 Medium');
      expect(medium.cellsToRemove).toBe(18);
      expect(medium.color).toContain('yellow');
      
      const hard = SudokuGenerator.getDifficultySettings('hard');
      expect(hard.name).toBe('16×16 Hard');
      expect(hard.cellsToRemove).toBe(180);
      expect(hard.color).toContain('red');
    });
  });
});
