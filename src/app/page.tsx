'use client';

import { SudokuProvider } from '@/context/SudokuContext';
import { SudokuGrid } from '@/components/SudokuGrid';
import { GameControls } from '@/components/GameControls';
import { MobileNumberPad } from '@/components/MobileNumberPad';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    console.log('SudokuZ: Page component mounted');
  }, []);

  return (
    <SudokuProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col p-4">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            SudokuZ
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            Challenge your mind with beautiful puzzles
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full">
          {/* Sudoku Grid */}
          <div className="flex-1 flex justify-center items-start">
            <SudokuGrid />
          </div>
          
          {/* Game Controls */}
          <div className="w-full lg:w-80 lg:min-w-80">
            <GameControls />
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-8 text-center text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
          <p className="mt-1 text-xs">© 2024, 2025 mangobanaani</p>
        </motion.footer>

        {/* Mobile Number Pad */}
        <MobileNumberPad />
      </div>
    </SudokuProvider>
  );
}
