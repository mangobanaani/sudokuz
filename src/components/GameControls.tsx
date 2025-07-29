'use client';

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Difficulty } from '@/types/sudoku';
import { useSudoku } from '@/context/SudokuContext';
import clsx from 'clsx';

const difficultyOptions: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: '4×4 Easy', color: 'from-green-500 to-green-600' },
  { value: 'medium', label: '6×6 Medium', color: 'from-yellow-500 to-yellow-600' },
  { value: 'hard', label: '16×16 Hard', color: 'from-red-500 to-red-600' },
];

const GameControls = memo(() => {
  const { 
    gameState, 
    newGame, 
    solvePuzzle, 
    getHint, 
    resetGame, 
    elapsedTime, 
    progress 
  } = useSudoku();

  const handleNewGame = useCallback((difficulty: Difficulty) => {
    newGame(difficulty);
  }, [newGame]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const buttonClasses = clsx(
    'px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200',
    'glass-panel hover:shadow-lg transform hover:scale-105 active:scale-95',
    'focus:outline-none focus:ring-2 focus:ring-blue-400/50'
  );

  return (
    <motion.div 
      className="space-y-3 sm:space-y-4 lg:space-y-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Game Stats */}
      <div className="glass-panel p-3 sm:p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Time</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{formatTime(elapsedTime)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Progress</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">{progress}%</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 sm:mt-3 w-full bg-gray-700 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="glass-panel p-3 sm:p-4 rounded-lg">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">New Game</h3>
        <div className="grid grid-cols-1 gap-2">
          {difficultyOptions.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleNewGame(option.value)}
              className={clsx(
                buttonClasses,
                `bg-gradient-to-r ${option.color}`,
                'text-sm sm:text-base', // Responsive text size
                'py-2 sm:py-2.5', // Responsive padding
                gameState.difficulty === option.value && 'ring-2 ring-white/50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid={`new-game-${option.value}`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Game Actions */}
      <div className="glass-panel p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Actions</h3>
        
        <motion.button
          onClick={getHint}
          disabled={gameState.isComplete}
          className={clsx(
            buttonClasses,
            'w-full bg-gradient-to-r from-purple-500 to-purple-600',
            'text-sm sm:text-base py-2 sm:py-2.5', // Responsive sizing
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
          )}
          whileHover={!gameState.isComplete ? { scale: 1.02 } : {}}
          whileTap={!gameState.isComplete ? { scale: 0.98 } : {}}
          data-testid="hint-button"
        >
          💡 Get Hint
        </motion.button>

        <motion.button
          onClick={resetGame}
          className={clsx(
            buttonClasses,
            'w-full bg-gradient-to-r from-yellow-500 to-yellow-600',
            'text-sm sm:text-base py-2 sm:py-2.5'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="reset-button"
        >
          🔄 Reset
        </motion.button>

        <motion.button
          onClick={solvePuzzle}
          disabled={gameState.isComplete}
          className={clsx(
            buttonClasses,
            'w-full bg-gradient-to-r from-orange-500 to-orange-600',
            'text-sm sm:text-base py-2 sm:py-2.5',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
          )}
          whileHover={!gameState.isComplete ? { scale: 1.02 } : {}}
          whileTap={!gameState.isComplete ? { scale: 0.98 } : {}}
          data-testid="solve-button"
        >
          🔍 Solve
        </motion.button>
      </div>

      {/* Game Status */}
      {gameState.isComplete && (
        <motion.div
          className="glass-panel p-3 sm:p-4 rounded-lg text-center bg-gradient-to-r from-green-500/20 to-blue-500/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <p className="text-xl sm:text-2xl font-bold text-green-400 mb-2">🎉 Congratulations!</p>
          <p className="text-gray-300 text-sm sm:text-base">You completed the puzzle in {formatTime(elapsedTime)}!</p>
        </motion.div>
      )}
    </motion.div>
  );
});

GameControls.displayName = 'GameControls';

export { GameControls };
