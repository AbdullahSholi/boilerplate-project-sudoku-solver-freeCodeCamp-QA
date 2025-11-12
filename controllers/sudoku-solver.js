class SudokuSolver {
  constructor() {
    this.SIZE = 9;
    this.SUBGRID = 3;
  }

  rowToIndex(row) {
    return this._normalizeRow(row);
  }

  columnToIndex(column) {
    return this._normalizeColumn(column);
  }

  validate(puzzleString) {
    if (typeof puzzleString !== 'string') {
      return { valid: false, error: 'Invalid characters in puzzle' };
    }

    if (puzzleString.length !== this.SIZE * this.SIZE) {
      return { valid: false, error: 'Expected puzzle to be 81 characters long' };
    }

    if (/[^1-9.]/.test(puzzleString)) {
      return { valid: false, error: 'Invalid characters in puzzle' };
    }

    return { valid: true };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const normalized = this._normalizeInputs(puzzleString, row, column, value);
    if (!normalized) return false;

    const { grid, rowIndex, columnIndex, val, originalValue } = normalized;
    grid[rowIndex][columnIndex] = '.';

    for (let c = 0; c < this.SIZE; c++) {
      if (c !== columnIndex && grid[rowIndex][c] === val) {
        grid[rowIndex][columnIndex] = originalValue;
        return false;
      }
    }
    grid[rowIndex][columnIndex] = originalValue;
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const normalized = this._normalizeInputs(puzzleString, row, column, value);
    if (!normalized) return false;

    const { grid, rowIndex, columnIndex, val, originalValue } = normalized;
    grid[rowIndex][columnIndex] = '.';

    for (let r = 0; r < this.SIZE; r++) {
      if (r !== rowIndex && grid[r][columnIndex] === val) {
        grid[rowIndex][columnIndex] = originalValue;
        return false;
      }
    }
    grid[rowIndex][columnIndex] = originalValue;
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const normalized = this._normalizeInputs(puzzleString, row, column, value);
    if (!normalized) return false;

    const { grid, rowIndex, columnIndex, val, originalValue } = normalized;
    grid[rowIndex][columnIndex] = '.';

    const startRow = Math.floor(rowIndex / this.SUBGRID) * this.SUBGRID;
    const startCol = Math.floor(columnIndex / this.SUBGRID) * this.SUBGRID;

    for (let r = 0; r < this.SUBGRID; r++) {
      for (let c = 0; c < this.SUBGRID; c++) {
        const currentRow = startRow + r;
        const currentCol = startCol + c;
        if ((currentRow !== rowIndex || currentCol !== columnIndex) && grid[currentRow][currentCol] === val) {
          grid[rowIndex][columnIndex] = originalValue;
          return false;
        }
      }
    }
    grid[rowIndex][columnIndex] = originalValue;
    return true;
  }

  solve(puzzleString) {
    const validation = this.validate(puzzleString);
    if (!validation.valid) {
      return null;
    }

    const grid = this._stringToGrid(puzzleString);

    if (!this._isInitialBoardValid(grid)) {
      return null;
    }

    if (this._solveBacktracking(grid)) {
      return this._gridToString(grid);
    }

    return null;
  }

  _normalizeInputs(puzzleString, row, column, value) {
    const validation = this.validate(puzzleString);
    if (!validation.valid) return null;

    const rowIndex = this._normalizeRow(row);
    const columnIndex = this._normalizeColumn(column);
    const val = this._normalizeValue(value);

    if (rowIndex === null || columnIndex === null || val === null) {
      return null;
    }

    const grid = this._stringToGrid(puzzleString);
    const originalValue = grid[rowIndex][columnIndex];

    return { grid, rowIndex, columnIndex, val, originalValue };
  }

  _normalizeRow(row) {
    if (typeof row === 'string') {
      const trimmed = row.trim();
      if (!trimmed) return null;
      const upper = trimmed.toUpperCase();
      if (upper.length === 1) {
        const code = upper.charCodeAt(0);
        if (code >= 65 && code <= 73) {
          return code - 65;
        }
      }

      const parsed = Number(trimmed);
      if (!Number.isNaN(parsed)) {
        row = parsed;
      } else {
        return null;
      }
    }

    if (Number.isInteger(row)) {
      if (row >= 1 && row <= this.SIZE) {
        return row - 1;
      }
      if (row >= 0 && row < this.SIZE) {
        return row;
      }
    }

    return null;
  }

  _normalizeColumn(column) {
    if (typeof column === 'string') {
      const trimmed = column.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      if (Number.isNaN(parsed)) {
        return null;
      }
      column = parsed;
    }

    if (Number.isInteger(column)) {
      if (column >= 1 && column <= this.SIZE) {
        return column - 1;
      }
      if (column >= 0 && column < this.SIZE) {
        return column;
      }
    }

    return null;
  }

  _normalizeValue(value) {
    const stringVal = String(value);
    if (/^[1-9]$/.test(stringVal)) {
      return stringVal;
    }
    return null;
  }

  _stringToGrid(puzzleString) {
    const grid = [];
    for (let r = 0; r < this.SIZE; r++) {
      const row = puzzleString.slice(r * this.SIZE, (r + 1) * this.SIZE).split('');
      grid.push(row);
    }
    return grid;
  }

  _gridToString(grid) {
    return grid.map(row => row.join('')).join('');
  }

  _isInitialBoardValid(grid) {
    for (let r = 0; r < this.SIZE; r++) {
      for (let c = 0; c < this.SIZE; c++) {
        const value = grid[r][c];
        if (value === '.') continue;
        grid[r][c] = '.';
        const isSafe = this._isSafe(grid, r, c, value);
        grid[r][c] = value;
        if (!isSafe) {
          return false;
        }
      }
    }
    return true;
  }

  _isSafe(grid, row, column, value) {
    for (let c = 0; c < this.SIZE; c++) {
      if (grid[row][c] === value) {
        return false;
      }
    }

    for (let r = 0; r < this.SIZE; r++) {
      if (grid[r][column] === value) {
        return false;
      }
    }

    const startRow = Math.floor(row / this.SUBGRID) * this.SUBGRID;
    const startCol = Math.floor(column / this.SUBGRID) * this.SUBGRID;

    for (let r = 0; r < this.SUBGRID; r++) {
      for (let c = 0; c < this.SUBGRID; c++) {
        if (grid[startRow + r][startCol + c] === value) {
          return false;
        }
      }
    }

    return true;
  }

  _solveBacktracking(grid) {
    for (let row = 0; row < this.SIZE; row++) {
      for (let column = 0; column < this.SIZE; column++) {
        if (grid[row][column] === '.') {
          for (let num = 1; num <= this.SIZE; num++) {
            const val = String(num);
            if (this._isSafe(grid, row, column, val)) {
              grid[row][column] = val;
              if (this._solveBacktracking(grid)) {
                return true;
              }
              grid[row][column] = '.';
            }
          }
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = SudokuSolver;

