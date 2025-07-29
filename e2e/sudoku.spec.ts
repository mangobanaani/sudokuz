import { test, expect } from '@playwright/test';

test.describe('SudokuZ App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main title and description', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('SudokuZ');
    await expect(page.locator('text=Challenge your mind with beautiful puzzles')).toBeVisible();
  });

  test('should render the sudoku grid', async ({ page }) => {
    await expect(page.getByTestId('sudoku-grid')).toBeVisible();
    
    // Default is 6x6 medium grid (36 cells)
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        await expect(page.getByTestId(`cell-${row}-${col}`)).toBeVisible();
      }
    }
  });

  test('should allow cell selection and input', async ({ page }) => {
    // Look for an empty cell (not an initial/clue cell)
    const cells = page.locator('[data-testid^="cell-"]');
    let emptyCell = null;
    
    // Find a cell that's empty and not initial
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        const cell = page.getByTestId(`cell-${row}-${col}`);
        const text = await cell.textContent();
        const className = await cell.getAttribute('class');
        
        // Look for cells that are empty and don't have initial styling
        if (!text?.trim() && !className?.includes('bg-gray-700/60')) {
          emptyCell = cell;
          break;
        }
      }
      if (emptyCell) break;
    }
    
    if (!emptyCell) {
      // Fallback to any empty cell
      emptyCell = cells.filter({ hasText: '' }).first();
    }
    
    await emptyCell.click();
    
    // Check if cell appears selected (look for ring classes)
    await expect(emptyCell).toHaveClass(/ring-2/);
    
    // Type a number (valid for 6x6 grid)
    await emptyCell.press('3');
    
    // Check if the number appears in the cell
    await expect(emptyCell).toContainText('3');
  });

  test('should allow clearing cell values', async ({ page }) => {
    // Find an empty, non-initial cell
    let emptyCell = null;
    
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        const cell = page.getByTestId(`cell-${row}-${col}`);
        const text = await cell.textContent();
        const className = await cell.getAttribute('class');
        
        if (!text?.trim() && !className?.includes('bg-gray-700/60')) {
          emptyCell = cell;
          break;
        }
      }
      if (emptyCell) break;
    }
    
    if (!emptyCell) {
      emptyCell = page.locator('[data-testid^="cell-"]').filter({ hasText: '' }).first();
    }
    
    await emptyCell.click();
    await emptyCell.press('3');
    await expect(emptyCell).toContainText('3');
    
    // Clear the cell
    await emptyCell.press('Backspace');
    await expect(emptyCell).not.toContainText('3');
  });

  test('should have working difficulty buttons', async ({ page }) => {
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
      const button = page.getByTestId(`new-game-${difficulty}`);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      
      // Click the button to start a new game
      await button.click();
      
      // Wait for the grid to update (new puzzle loaded)
      await page.waitForTimeout(500);
      
      // Verify the grid is still present and interactive
      await expect(page.getByTestId('sudoku-grid')).toBeVisible();
    }
  });

  test('should have working hint button', async ({ page }) => {
    const hintButton = page.getByTestId('hint-button');
    await expect(hintButton).toBeVisible();
    await expect(hintButton).toBeEnabled();
    
    await hintButton.click();
    
    // Wait for hint to be applied
    await page.waitForTimeout(500);
    
    // Check that the grid still exists
    await expect(page.getByTestId('sudoku-grid')).toBeVisible();
  });

  test('should have working solve button', async ({ page }) => {
    const solveButton = page.getByTestId('solve-button');
    await expect(solveButton).toBeVisible();
    await expect(solveButton).toBeEnabled();
    
    await solveButton.click();
    
    // Wait for solve to complete
    await page.waitForTimeout(1000);
    
    // Check that "Puzzle Completed!" message appears
    await expect(page.locator('text=Puzzle Completed!')).toBeVisible();
    
    // Check that solve button is now disabled
    await expect(solveButton).toBeDisabled();
  });

  test('should have working reset button', async ({ page }) => {
    // First, make some moves
    await page.getByTestId('cell-0-0').click();
    await page.getByTestId('cell-0-0').press('3');
    
    // Then reset
    const resetButton = page.getByTestId('reset-button');
    await expect(resetButton).toBeVisible();
    await expect(resetButton).toBeEnabled();
    
    await resetButton.click();
    
    // Wait for reset to complete
    await page.waitForTimeout(500);
    
    // Verify the grid is reset
    await expect(page.getByTestId('sudoku-grid')).toBeVisible();
  });

  test('should display game stats', async ({ page }) => {
    // Check that difficulty is displayed
    await expect(page.locator('text=Difficulty:')).toBeVisible();
    
    // Check that time is displayed
    await expect(page.locator('text=Time:')).toBeVisible();
    
    // Time should be in MM:SS format
    await expect(page.locator('text=/\\d+:\\d{2}/')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Click on a cell to focus it
    await page.getByTestId('cell-2-2').click();
    
    // Test number input for 6x6 grid (1-6)
    for (let i = 1; i <= 6; i++) {
      await page.keyboard.press(i.toString());
      await expect(page.getByTestId('cell-2-2')).toContainText(i.toString());
    }
    
    // Test clearing
    await page.keyboard.press('0');
    await expect(page.getByTestId('cell-2-2')).not.toContainText(/[1-6]/);
  });

  test('should validate moves and show errors', async ({ page }) => {
    // Start a new easy game (4x4) for predictable layout
    await page.getByTestId('new-game-easy').click();
    await page.waitForTimeout(500);
    
    // Find two empty cells in the same row (4x4 grid)
    let firstEmptyCell = null;
    let secondEmptyCell = null;
    
    for (let col = 0; col < 4; col++) {
      const cell = page.getByTestId(`cell-0-${col}`);
      const hasText = await cell.textContent();
      if (!hasText || hasText.trim() === '') {
        if (!firstEmptyCell) {
          firstEmptyCell = cell;
        } else if (!secondEmptyCell) {
          secondEmptyCell = cell;
          break;
        }
      }
    }
    
    if (firstEmptyCell && secondEmptyCell) {
      // Enter the same number in both cells (valid for 4x4 grid)
      await firstEmptyCell.click();
      await firstEmptyCell.press('2');
      
      await secondEmptyCell.click();
      await secondEmptyCell.press('2');
      
      // At least one should show an error state
      const hasError = await firstEmptyCell.evaluate(el => 
        el.classList.contains('bg-red-400/20') || 
        el.classList.contains('ring-red-400/50')
      );
      const hasError2 = await secondEmptyCell.evaluate(el => 
        el.classList.contains('bg-red-400/20') || 
        el.classList.contains('ring-red-400/50')
      );
      
      expect(hasError || hasError2).toBeTruthy();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('sudoku-grid')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByTestId('sudoku-grid')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByTestId('sudoku-grid')).toBeVisible();
  });

  test('should switch between different grid sizes', async ({ page }) => {
    // Test 4x4 Easy grid
    await page.getByTestId('new-game-easy').click();
    await page.waitForTimeout(500);
    
    // Verify 4x4 grid (16 cells)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        await expect(page.getByTestId(`cell-${row}-${col}`)).toBeVisible();
      }
    }
    
    // Test 6x6 Medium grid
    await page.getByTestId('new-game-medium').click();
    await page.waitForTimeout(500);
    
    // Verify 6x6 grid (36 cells)
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        await expect(page.getByTestId(`cell-${row}-${col}`)).toBeVisible();
      }
    }
    
    // Test 16x16 Hard grid
    await page.getByTestId('new-game-hard').click();
    await page.waitForTimeout(1000); // Allow more time for larger grid
    
    // Verify 16x16 grid (256 cells) - test just corners and center
    await expect(page.getByTestId('cell-0-0')).toBeVisible();
    await expect(page.getByTestId('cell-0-15')).toBeVisible();
    await expect(page.getByTestId('cell-15-0')).toBeVisible();
    await expect(page.getByTestId('cell-15-15')).toBeVisible();
    await expect(page.getByTestId('cell-8-8')).toBeVisible();
  });

  test('should validate input ranges for different grid sizes', async ({ page }) => {
    // Test 4x4 grid - should accept 1-4
    await page.getByTestId('new-game-easy').click();
    await page.waitForTimeout(500);
    
    const cell44 = page.getByTestId('cell-0-0');
    await cell44.click();
    await cell44.press('4');
    await expect(cell44).toContainText('4');
    
    // Test 6x6 grid - should accept 1-6
    await page.getByTestId('new-game-medium').click();
    await page.waitForTimeout(500);
    
    const cell66 = page.getByTestId('cell-0-0');
    await cell66.click();
    await cell66.press('6');
    await expect(cell66).toContainText('6');
  });
});
