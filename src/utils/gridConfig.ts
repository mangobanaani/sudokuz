import { Difficulty, GridConfig } from '@/types/sudoku';

export const getGridConfig = (difficulty: Difficulty): GridConfig => {
  switch (difficulty) {
    case 'easy':
      return {
        size: 4,
        subGridRows: 2,
        subGridCols: 2,
        maxNumber: 4,
      };
    case 'medium':
      return {
        size: 6,
        subGridRows: 2,
        subGridCols: 3,
        maxNumber: 6,
      };
    case 'hard':
      return {
        size: 16,
        subGridRows: 4,
        subGridCols: 4,
        maxNumber: 16,
      };
    default:
      return {
        size: 6,
        subGridRows: 2,
        subGridCols: 3,
        maxNumber: 6,
      };
  }
};

export const getDifficultySettings = (difficulty: Difficulty) => {
  const config = getGridConfig(difficulty);
  const totalCells = config.size * config.size;
  
  switch (difficulty) {
    case 'easy':
      return { 
        cellsToRemove: Math.floor(totalCells * 0.4), // 40% removed for 4x4
        name: '4×4 Easy' 
      };
    case 'medium':
      return { 
        cellsToRemove: Math.floor(totalCells * 0.5), // 50% removed for 6x6
        name: '6×6 Medium' 
      };
    case 'hard':
      return { 
        cellsToRemove: Math.floor(totalCells * 0.7), // 70% removed for 16x16
        name: '16×16 Hard' 
      };
    default:
      return { 
        cellsToRemove: Math.floor(totalCells * 0.5), 
        name: '6×6 Medium' 
      };
  }
};
