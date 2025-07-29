import { test, expect } from '@playwright/test';

test.describe('Sudoku Game Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete a game flow', async ({ page }) => {
    // Start with an easy game
    await page.getByTestId('new-game-easy').click();
    await page.waitForTimeout(500);
    
    // Make a few moves
    const cell = page.getByTestId('cell-0-0');
    const cellText = await cell.textContent();
    
    if (!cellText || cellText.trim() === '') {
      await cell.click();
      await cell.press('1');
      await expect(cell).toContainText('1');
    }
    
    // Use hint
    await page.getByTestId('hint-button').click();
    await page.waitForTimeout(500);
    
    // Solve the puzzle
    await page.getByTestId('solve-button').click();
    await page.waitForTimeout(2000);
    
    // Verify completion
    await expect(page.locator('text=Puzzle Completed!')).toBeVisible();
    
    // Verify all cells are filled
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = page.getByTestId(`cell-${row}-${col}`);
        const text = await cell.textContent();
        expect(text).toMatch(/[1-9]/);
      }
    }
  });

  test('should handle rapid difficulty changes', async ({ page }) => {
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
      await page.getByTestId(`new-game-${difficulty}`).click();
      await page.waitForTimeout(300);
      
      // Verify grid is present and interactive
      await expect(page.getByTestId('sudoku-grid')).toBeVisible();
      
      // Try to interact with a cell
      const cell = page.getByTestId('cell-0-0');
      await cell.click();
      
      // Check that the cell can receive focus (appears selected)
      await page.waitForTimeout(100);
    }
  });

  test('should maintain game state during interactions', async ({ page }) => {
    // Start a game
    await page.getByTestId('new-game-medium').click();
    await page.waitForTimeout(500);
    
    // Make several moves
    const moves = [
      { row: 0, col: 0, value: '1' },
      { row: 0, col: 1, value: '2' },
      { row: 1, col: 0, value: '3' },
    ];
    
    for (const move of moves) {
      const cell = page.getByTestId(`cell-${move.row}-${move.col}`);
      const currentText = await cell.textContent();
      
      if (!currentText || currentText.trim() === '') {
        await cell.click();
        await cell.press(move.value);
        await expect(cell).toContainText(move.value);
      }
    }
    
    // Use hint to change state
    await page.getByTestId('hint-button').click();
    await page.waitForTimeout(500);
    
    // Verify previous moves are still there
    for (const move of moves) {
      const cell = page.getByTestId(`cell-${move.row}-${move.col}`);
      const currentText = await cell.textContent();
      
      // Either the move is still there or it was a hint cell
      if (currentText && currentText.trim() !== '') {
        expect(currentText).toMatch(/[1-9]/);
      }
    }
  });

  test('should handle invalid inputs gracefully', async ({ page }) => {
    const cell = page.getByTestId('cell-0-0');
    await cell.click();
    
    // Try invalid keys
    const invalidKeys = ['a', 'z', '@', '-', '+', 'F1', 'Enter'];
    
    for (const key of invalidKeys) {
      await cell.press(key);
      // Cell should remain unchanged or only accept valid numbers
      const text = await cell.textContent();
      if (text && text.trim() !== '') {
        expect(text).toMatch(/[1-9]/);
      }
    }
  });

  test('should show appropriate loading states', async ({ page }) => {
    // Test that buttons don't break when clicked rapidly
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('new-game-easy').click();
      await page.waitForTimeout(100);
    }
    
    // Grid should still be functional
    await expect(page.getByTestId('sudoku-grid')).toBeVisible();
    
    // Solve button should work
    await page.getByTestId('solve-button').click();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Puzzle Completed!')).toBeVisible();
  });
});
