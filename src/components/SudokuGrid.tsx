'use client';

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SudokuCell } from './SudokuCell';
import { useSudoku } from '@/context/SudokuContext';

const SudokuGrid = memo(() => {
  const { gameState, makeMove, selectCell, isInitialCell, hasError, isSelected } = useSudoku();
  const { gridConfig } = gameState;

  const handleCellClick = useCallback((row: number, col: number) => {
    selectCell(row, col);
  }, [selectCell]);

  const handleCellChange = useCallback((row: number, col: number, value: number | null) => {
    makeMove(row, col, value);
  }, [makeMove]);

  const renderSubGrid = useCallback((subGridRow: number, subGridCol: number) => {
    const cells = [];
    const startRow = subGridRow * gridConfig.subGridRows;
    const startCol = subGridCol * gridConfig.subGridCols;

    for (let i = 0; i < gridConfig.subGridRows; i++) {
      for (let j = 0; j < gridConfig.subGridCols; j++) {
        const row = startRow + i;
        const col = startCol + j;
        
        // Skip if row/col is out of bounds or grid not properly initialized
        if (row >= gridConfig.size || col >= gridConfig.size || 
            !gameState.grid || !gameState.grid[row] || gameState.grid[row][col] === undefined) {
          continue;
        }
        
        const key = `${row}-${col}`;

        cells.push(
          <SudokuCell
            key={key}
            value={gameState.grid[row][col]}
            row={row}
            col={col}
            isInitial={isInitialCell(row, col)}
            hasError={hasError(row, col)}
            isSelected={isSelected(row, col)}
            onSelect={handleCellClick}
            onValueChange={handleCellChange}
            maxNumber={gridConfig.maxNumber}
          />
        );
      }
    }

    return cells;
  }, [gameState.grid, gridConfig, isInitialCell, hasError, isSelected, handleCellClick, handleCellChange]);

  // Don't render if grid is not properly initialized
  if (!gameState.grid || !gameState.gridConfig || gameState.grid.length !== gameState.gridConfig.size) {
    return (
      <motion.div
        className="sudoku-grid glass-panel p-2 sm:p-4 lg:p-6 mx-auto w-full max-w-fit flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        data-testid="sudoku-grid"
      >
        <div className="text-white/60">Loading puzzle...</div>
      </motion.div>
    );
  }

  const subGridsPerRow = Math.ceil(gridConfig.size / gridConfig.subGridRows);
  const subGridsPerCol = Math.ceil(gridConfig.size / gridConfig.subGridCols);

  return (
    <motion.div
      className="sudoku-grid glass-panel p-2 sm:p-4 lg:p-6 mx-auto w-full max-w-fit"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-testid="sudoku-grid"
    >
      <div 
        className={`grid gap-1 sm:gap-2 bg-gray-800/30 p-1 sm:p-2 rounded-lg`}
        style={{ 
          gridTemplateColumns: `repeat(${subGridsPerCol}, 1fr)`,
          gridTemplateRows: `repeat(${subGridsPerRow}, 1fr)`
        }}
      >
        {Array.from({ length: subGridsPerRow * subGridsPerCol }, (_, index) => {
          const subGridRow = Math.floor(index / subGridsPerCol);
          const subGridCol = index % subGridsPerCol;
          
          return (
            <div
              key={index}
              className={`grid gap-[1px] sm:gap-1 bg-gray-700/20 p-1 sm:p-2 rounded border border-gray-600/50`}
              style={{
                gridTemplateColumns: `repeat(${gridConfig.subGridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridConfig.subGridRows}, 1fr)`
              }}
            >
              {renderSubGrid(subGridRow, subGridCol)}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});

SudokuGrid.displayName = 'SudokuGrid';

export { SudokuGrid };
