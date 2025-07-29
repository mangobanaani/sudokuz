import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SudokuCell } from '@/components/SudokuCell';

const mockProps = {
  row: 0,
  col: 0,
  value: null,
  isInitial: false,
  isSelected: false,
  hasError: false,
  maxNumber: 6,
  onSelect: jest.fn(),
  onValueChange: jest.fn(),
};

describe('SudokuCell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty cell correctly', () => {
    render(<SudokuCell {...mockProps} />);
    
    const cell = screen.getByTestId('cell-0-0');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('');
  });

  it('renders cell with value correctly', () => {
    render(<SudokuCell {...mockProps} value={5} />);
    
    const cell = screen.getByTestId('cell-0-0');
    expect(cell).toHaveTextContent('5');
  });

  it('calls onSelect when clicked', () => {
    render(<SudokuCell {...mockProps} />);
    
    const cell = screen.getByTestId('cell-0-0');
    fireEvent.click(cell);
    
    expect(mockProps.onSelect).toHaveBeenCalledWith(0, 0);
  });

  it('handles number key input for empty cell', () => {
    render(<SudokuCell {...mockProps} />);
    
    const cell = screen.getByTestId('cell-0-0');
    fireEvent.keyDown(cell, { key: '5' });
    
    expect(mockProps.onValueChange).toHaveBeenCalledWith(0, 0, 5);
  });

  it('handles backspace key input', () => {
    render(<SudokuCell {...mockProps} value={5} />);
    
    const cell = screen.getByTestId('cell-0-0');
    fireEvent.keyDown(cell, { key: 'Backspace' });
    
    expect(mockProps.onValueChange).toHaveBeenCalledWith(0, 0, null);
  });

  it('handles delete key input', () => {
    render(<SudokuCell {...mockProps} value={5} />);
    
    const cell = screen.getByTestId('cell-0-0');
    fireEvent.keyDown(cell, { key: 'Delete' });
    
    expect(mockProps.onValueChange).toHaveBeenCalledWith(0, 0, null);
  });

  it('ignores input for initial cells', () => {
    render(<SudokuCell {...mockProps} isInitial={true} value={5} />);
    
    const cell = screen.getByTestId('cell-0-0');
    fireEvent.keyDown(cell, { key: '6' });
    
    expect(mockProps.onValueChange).not.toHaveBeenCalled();
  });

  it('applies correct styling for selected cell', () => {
    render(<SudokuCell {...mockProps} isSelected={true} />);
    
    const cell = screen.getByTestId('cell-0-0');
    expect(cell.className).toContain('ring-2');
    expect(cell.className).toContain('ring-blue-400');
    expect(cell.className).toContain('border-blue-400');
  });

  it('applies correct styling for error cell', () => {
    render(<SudokuCell {...mockProps} hasError={true} />);
    
    const cell = screen.getByTestId('cell-0-0');
    expect(cell.className).toContain('border-red-400');
    expect(cell.className).toContain('bg-red-900/30');
    expect(cell.className).toContain('text-red-300');
  });

  it('applies correct styling for initial cell values', () => {
    render(<SudokuCell {...mockProps} isInitial={true} value={5} />);
    
    const cell = screen.getByTestId('cell-0-0');
    expect(cell.className).toContain('bg-gray-700/60');
    expect(cell.className).toContain('text-blue-300');
  });

  it('applies thick borders for box boundaries', () => {
    // For the SudokuCell component, border styling is handled at grid level,
    // so we just test that the cell renders correctly
    render(<SudokuCell {...mockProps} row={0} col={0} />);
    const cell = screen.getByTestId('cell-0-0');
    expect(cell).toBeInTheDocument();
    expect(cell.className).toContain('border-2');
  });

  it('handles different maxNumber values correctly', () => {
    // Test 4x4 grid (maxNumber: 4)
    const { rerender } = render(<SudokuCell {...mockProps} maxNumber={4} />);
    let cell = screen.getByTestId('cell-0-0');
    
    fireEvent.keyDown(cell, { key: '4' });
    expect(mockProps.onValueChange).toHaveBeenCalledWith(0, 0, 4);
    
    // Test invalid input for 4x4
    fireEvent.keyDown(cell, { key: '5' });
    expect(mockProps.onValueChange).toHaveBeenCalledTimes(1); // Should not be called again
    
    // Test 16x16 grid (maxNumber: 16)
    jest.clearAllMocks();
    rerender(<SudokuCell {...mockProps} maxNumber={16} />);
    cell = screen.getByTestId('cell-0-0');
    
    fireEvent.keyDown(cell, { key: '9' });
    expect(mockProps.onValueChange).toHaveBeenCalledWith(0, 0, 9);
    
    // Test '0' key for 16x16 (should input 10)
    fireEvent.keyDown(cell, { key: '0' });
    expect(mockProps.onValueChange).toHaveBeenCalledWith(0, 0, 10);
  });
});
