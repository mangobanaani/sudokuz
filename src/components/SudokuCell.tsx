'use client';

import React, { memo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SudokuCellProps {
  row: number;
  col: number;
  value: number | null;
  isInitial: boolean;
  isSelected: boolean;
  hasError: boolean;
  maxNumber: number;
  onSelect: (row: number, col: number) => void;
  onValueChange: (row: number, col: number, value: number | null) => void;
}

const SudokuCell = memo(({
  row,
  col,
  value,
  isInitial,
  isSelected,
  hasError,
  maxNumber,
  onSelect,
  onValueChange,
}: SudokuCellProps) => {
  const cellRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    onSelect(row, col);
  }, [row, col, onSelect]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Prevent scrolling when touching the cell
    e.preventDefault();
    onSelect(row, col);
  }, [row, col, onSelect]);

  const handleDivKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isInitial) {
      e.preventDefault();
      return;
    }

    const key = e.key;
    
    // Handle numbers based on maxNumber (1-4, 1-6, or 1-16)
    const numberRegex = maxNumber <= 9 ? new RegExp(`^[1-${maxNumber}]$`) : /^[1-9]$/;
    if (numberRegex.test(key)) {
      e.preventDefault();
      onValueChange(row, col, parseInt(key));
    }
    // For 16x16, also handle two-digit numbers like 10-16 via special keys
    else if (maxNumber === 16 && key === '0') {
      e.preventDefault();
      // Allow 0 to represent 10 for 16x16 grids
      onValueChange(row, col, 10);
    }
    // Handle delete/backspace
    else if (key === 'Delete' || key === 'Backspace' || key === ' ') {
      e.preventDefault();
      onValueChange(row, col, null);
    }
    // Handle arrow keys for navigation
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
      let newRow = row;
      let newCol = col;
      
      switch (key) {
        case 'ArrowUp':
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          newRow = Math.min(8, row + 1);
          break;
        case 'ArrowLeft':
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          newCol = Math.min(8, col + 1);
          break;
      }
      
      if (newRow !== row || newCol !== col) {
        onSelect(newRow, newCol);
      }
    }
  }, [row, col, isInitial, maxNumber, onValueChange, onSelect]);

  // Auto-focus when selected
  useEffect(() => {
    if (isSelected) {
      if (cellRef.current) {
        cellRef.current.focus();
      }
    }
  }, [isSelected]);

  const cellClasses = clsx(
    // Responsive sizing based on grid size
    maxNumber === 4 ? 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20' : // 4x4: larger cells
    maxNumber === 6 ? 'w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14' : // 6x6: medium cells  
    'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10', // 16x16: smaller cells
    'flex items-center justify-center',
    // Responsive text sizing
    maxNumber === 4 ? 'text-lg sm:text-xl lg:text-2xl' : // 4x4: larger text
    maxNumber === 6 ? 'text-sm sm:text-base lg:text-lg' : // 6x6: medium text
    'text-xs sm:text-sm lg:text-base', // 16x16: smaller text
    'font-bold rounded-md transition-all duration-200 cursor-pointer',
    // Touch-friendly interactions
    'border-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50',
    'active:scale-95 select-none', // Prevent text selection on touch
    // Touch target size (minimum 44px for accessibility)
    'min-h-[44px] min-w-[44px]',
    {
      // Initial cells (clues)
      'bg-gray-700/60 border-gray-600 text-blue-300 cursor-default': isInitial,
      // User cells
      'bg-gray-800/40 border-gray-500 text-white hover:bg-gray-700/50 active:bg-gray-600/50': !isInitial,
      // Selected state
      'ring-2 ring-blue-400 border-blue-400 shadow-lg shadow-blue-400/30': isSelected,
      // Error state
      'border-red-400 bg-red-900/30 text-red-300': hasError,
      // Combined selected + error
      'ring-red-400 border-red-400': isSelected && hasError,
    }
  );

  return (
    <motion.div
      ref={cellRef}
      className={cellClasses}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onKeyDown={handleDivKeyDown}
      whileHover={!isInitial ? { scale: 1.05 } : {}}
      whileTap={!isInitial ? { scale: 0.95 } : {}}
      layout
      tabIndex={0}
      data-testid={`cell-${row}-${col}`}
    >
      {value || ''}
    </motion.div>
  );
});

SudokuCell.displayName = 'SudokuCell';

export { SudokuCell };
