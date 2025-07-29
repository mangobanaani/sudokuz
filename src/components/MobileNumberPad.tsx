'use client';

import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSudoku } from '@/context/SudokuContext';
import { useTouch, useScreenSize } from '@/hooks/useTouch';
import clsx from 'clsx';

const MobileNumberPad = memo(() => {
  const { gameState, makeMove, isInitialCell } = useSudoku();
  const isTouch = useTouch();
  const { isMobile, isTablet } = useScreenSize();
  const { selectedCell } = gameState;

  // Show number pad only on touch devices (mobile/tablet) and when a cell is selected
  const isVisible = isTouch && (isMobile || isTablet) && selectedCell && !isInitialCell(selectedCell.row, selectedCell.col);

  const handleNumberSelect = useCallback((number: number | null) => {
    if (selectedCell) {
      makeMove(selectedCell.row, selectedCell.col, number);
    }
  }, [selectedCell, makeMove]);

  const buttonClasses = clsx(
    'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center',
    'text-lg sm:text-xl font-bold rounded-lg',
    'bg-gray-800/60 border border-gray-600/50 text-white',
    'active:bg-gray-700/80 transition-all duration-150',
    'touch-manipulation select-none'
  );

  const clearButtonClasses = clsx(
    buttonClasses,
    'bg-red-600/60 border-red-500/50 text-red-100'
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          data-testid="mobile-number-pad"
        >
          <div className="glass-panel p-3 sm:p-4 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {/* Numbers 1-9 */}
              {Array.from({ length: 9 }, (_, i) => i + 1).map((number) => (
                <motion.button
                  key={number}
                  onClick={() => handleNumberSelect(number)}
                  className={buttonClasses}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  data-testid={`number-pad-${number}`}
                >
                  {number}
                </motion.button>
              ))}
              
              {/* Clear button */}
              <motion.button
                onClick={() => handleNumberSelect(null)}
                className={clearButtonClasses}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                data-testid="number-pad-clear"
              >
                ✕
              </motion.button>
            </div>
            
            {/* Instructions */}
            <p className="text-center text-white/60 text-xs sm:text-sm mt-2">
              Tap a number or ✕ to clear
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

MobileNumberPad.displayName = 'MobileNumberPad';

export { MobileNumberPad };
