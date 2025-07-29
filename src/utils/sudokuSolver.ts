import { SudokuGrid, CellPosition, ValidationResult, Difficulty, GridConfig } from '@/types/sudoku';
import { getGridConfig, getDifficultySettings } from './gridConfig';

/**
 * Optimized Sudoku solver with efficient algorithms and robust validation
 */
export class SudokuSolver {
  // Cache for validation results with size limit
  private static validationCache = new Map<string, boolean>();
  private static readonly MAX_CACHE_SIZE = 10000; // Reasonable cache size limit
  
  /**
   * Check if placing a number at a position is valid
   * Optimized with early termination and efficient box calculation
   */
  static isValidMove(grid: SudokuGrid, row: number, col: number, num: number, gridConfig: GridConfig): boolean {
    const size = gridConfig.size;
    
    // Check row - early termination
    for (let c = 0; c < size; c++) {
      if (c !== col && grid[row][c] === num) {
        return false;
      }
    }

    // Check column - early termination
    for (let r = 0; r < size; r++) {
      if (r !== row && grid[r][col] === num) {
        return false;
      }
    }

    // Check sub-grid box - optimized calculation
    const boxStartRow = Math.floor(row / gridConfig.subGridRows) * gridConfig.subGridRows;
    const boxStartCol = Math.floor(col / gridConfig.subGridCols) * gridConfig.subGridCols;
    
    for (let r = boxStartRow; r < boxStartRow + gridConfig.subGridRows; r++) {
      for (let c = boxStartCol; c < boxStartCol + gridConfig.subGridCols; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Solve sudoku using backtracking with optimized cell selection
   * Uses Most Constrained Variable (MCV) heuristic for better performance
   */
  static solve(grid: SudokuGrid, gridConfig: GridConfig): boolean {
    this.clearCache(); // Clear cache for fresh solve
    return this.solveRecursive(grid, gridConfig);
  }

  private static solveRecursive(grid: SudokuGrid, gridConfig: GridConfig): boolean {
    const bestCell = this.findBestEmptyCell(grid, gridConfig);
    if (!bestCell) return true; // Puzzle solved

    const [row, col] = bestCell;
    const possibleNumbers = this.getPossibleNumbers(grid, row, col, gridConfig);
    
    // Try numbers in order of constraint (fewer possibilities first)
    for (const num of possibleNumbers) {
      grid[row][col] = num;
      
      if (this.solveRecursive(grid, gridConfig)) return true;
      
      grid[row][col] = null; // Backtrack
    }

    return false;
  }

  /**
   * Find the empty cell with the fewest possible values (MCV heuristic)
   */
  private static findBestEmptyCell(grid: SudokuGrid, gridConfig: GridConfig): [number, number] | null {
    let bestCell: [number, number] | null = null;
    let minPossibilities = gridConfig.maxNumber + 1;

    for (let row = 0; row < gridConfig.size; row++) {
      for (let col = 0; col < gridConfig.size; col++) {
        if (grid[row][col] === null) {
          const possibilities = this.getPossibleNumbers(grid, row, col, gridConfig).length;
          
          if (possibilities < minPossibilities) {
            minPossibilities = possibilities;
            bestCell = [row, col];
            
            // If only one possibility, return immediately
            if (possibilities === 1) return bestCell;
          }
        }
      }
    }

    return bestCell;
  }

  /**
   * Get all possible numbers for a cell
   */
  private static getPossibleNumbers(grid: SudokuGrid, row: number, col: number, gridConfig: GridConfig): number[] {
    const possible: number[] = [];
    
    for (let num = 1; num <= gridConfig.maxNumber; num++) {
      if (this.isValidMove(grid, row, col, num, gridConfig)) {
        possible.push(num);
      }
    }
    
    return possible;
  }

  /**
   * Generate a complete valid Sudoku solution
   * Uses optimized solving with randomization for variety
   */
  static generateComplete(gridConfig: GridConfig): SudokuGrid {
    const size = gridConfig.size;
    const grid: SudokuGrid = Array(size).fill(null).map(() => Array(size).fill(null));
    this.fillGridRandomly(grid, gridConfig);
    return grid;
  }

  private static fillGridRandomly(grid: SudokuGrid, gridConfig: GridConfig): boolean {
    const emptyCell = this.findFirstEmptyCell(grid);
    if (!emptyCell) return true;

    const [row, col] = emptyCell;
    const numbers = this.shuffleArray(Array.from({ length: gridConfig.maxNumber }, (_, i) => i + 1));

    for (const num of numbers) {
      if (this.isValidMove(grid, row, col, num, gridConfig)) {
        grid[row][col] = num;
        
        if (this.fillGridRandomly(grid, gridConfig)) return true;
        
        grid[row][col] = null;
      }
    }

    return false;
  }

  private static findFirstEmptyCell(grid: SudokuGrid): [number, number] | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) return [row, col];
      }
    }
    return null;
  }

  // DEPRECATED: Not used - we use pre-made puzzles instead
  /*
  static removeNumbers(grid: SudokuGrid, difficulty: Difficulty, gridConfig: GridConfig): SudokuGrid {
    const puzzleGrid = this.cloneGrid(grid);
    const targetRemoval = getDifficultySettings(difficulty);

    // Create positions array with symmetrical pairs preference
    const positions = this.createRemovalOrder(gridConfig);
    
    let removed = 0;
    for (const { row, col } of positions) {
      if (removed >= targetRemoval.cellsToRemove) break;
      
      const backup = puzzleGrid[row][col];
      puzzleGrid[row][col] = null;
      
      // Verify puzzle still has unique solution
      if (this.hasUniqueSolution(puzzleGrid)) {
        removed++;
      } else {
        puzzleGrid[row][col] = backup;
      }
    }

    return puzzleGrid;
  }
  */

  private static getDifficultySettings(difficulty: Difficulty) {
    const settings = {
      easy: { cellsToRemove: 40, name: 'Easy' },
      medium: { cellsToRemove: 50, name: 'Medium' },
      hard: { cellsToRemove: 60, name: 'Hard' },
      expert: { cellsToRemove: 70, name: 'Expert' }
    };
    
    return settings[difficulty] || settings.medium;
  }

  private static createRemovalOrder(gridConfig: GridConfig): { row: number; col: number }[] {
    const positions: { row: number; col: number }[] = [];
    
    // Add all positions
    for (let row = 0; row < gridConfig.size; row++) {
      for (let col = 0; col < gridConfig.size; col++) {
        positions.push({ row, col });
      }
    }

    return this.shuffleArray(positions);
  }

  /**
   * Check if puzzle has exactly one solution
   * Optimized to stop at 2 solutions for efficiency
   */
  // DEPRECATED: These methods are no longer used (we use pre-made puzzles)
  /*
  static hasUniqueSolution(grid: SudokuGrid): boolean {
    const testGrid = this.cloneGrid(grid);
    return this.countSolutions(testGrid, 2) === 1;
  }

  private static countSolutions(grid: SudokuGrid, maxCount: number): number {
    const emptyCell = this.findFirstEmptyCell(grid);
    if (!emptyCell) return 1; // Found one solution

    const [row, col] = emptyCell;
    let solutionCount = 0;

    for (let num = 1; num <= 9; num++) {
      if (this.isValidMove(grid, row, col, num)) {
        grid[row][col] = num;
        solutionCount += this.countSolutions(grid, maxCount - solutionCount);
        grid[row][col] = null;
        
        if (solutionCount >= maxCount) break; // Early termination
      }
    }

    return solutionCount;
  }
  */

  /**
   * Validate entire grid and return conflicts
   */
  static validateGrid(grid: SudokuGrid, gridConfig: GridConfig): ValidationResult {
    const conflicts: CellPosition[] = [];

    for (let row = 0; row < gridConfig.size; row++) {
      for (let col = 0; col < gridConfig.size; col++) {
        const num = grid[row][col];
        if (num !== null) {
          // Temporarily remove the number to test validity
          grid[row][col] = null;
          
          if (!this.isValidMove(grid, row, col, num, gridConfig)) {
            conflicts.push({ row, col });
          }
          
          grid[row][col] = num; // Restore the number
        }
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts
    };
  }

  /**
   * Check if grid is complete and valid
   */
  static isComplete(grid: SudokuGrid, gridConfig: GridConfig): boolean {
    // Check all cells are filled
    for (let row = 0; row < gridConfig.size; row++) {
      for (let col = 0; col < gridConfig.size; col++) {
        if (grid[row][col] === null) return false;
      }
    }

    // Check validity
    return this.validateGrid(grid, gridConfig).isValid;
  }

  /**
   * Get a hint - returns a random empty cell that needs to be filled
   */
  static getHint(grid: SudokuGrid, solution: SudokuGrid, gridConfig: GridConfig): CellPosition | null {
    const emptyCells: CellPosition[] = [];
    
    for (let row = 0; row < gridConfig.size; row++) {
      for (let col = 0; col < gridConfig.size; col++) {
        if (grid[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return null;

    // Prefer cells with fewer possibilities (more helpful hints)
    emptyCells.sort((a, b) => {
      const aPossibilities = this.getPossibleNumbers(grid, a.row, a.col, gridConfig).length;
      const bPossibilities = this.getPossibleNumbers(grid, b.row, b.col, gridConfig).length;
      return aPossibilities - bPossibilities;
    });

    // Return the most constrained cell (best hint)
    return emptyCells[0];
  }

  // Utility methods
  private static cloneGrid(grid: SudokuGrid): SudokuGrid {
    return grid.map(row => [...row]);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static clearCache(): void {
    this.validationCache.clear();
  }
}
