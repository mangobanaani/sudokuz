import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SudokuZ - Modern Sudoku Game',
  description: 'A beautiful, modern Sudoku game with intelligent puzzle generation and glass-morphic design',
  keywords: 'sudoku, puzzle, game, brain training, logic',
  authors: [{ name: 'SudokuZ Team' }],
  openGraph: {
    title: 'SudokuZ - Modern Sudoku Game',
    description: 'A beautiful, modern Sudoku game with intelligent puzzle generation',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <main className="min-h-screen">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  )
}
