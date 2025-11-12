'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body || {};

      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      const validation = solver.validate(puzzle);
      if (!validation.valid) {
        return res.json({ error: validation.error });
      }

      if (typeof coordinate !== 'string') {
        return res.json({ error: 'Invalid coordinate' });
      }

      const trimmedCoordinate = coordinate.trim();
      if (!/^[A-Ia-i][1-9]$/.test(trimmedCoordinate)) {
        return res.json({ error: 'Invalid coordinate' });
      }

      if (!/^[1-9]$/.test(String(value))) {
        return res.json({ error: 'Invalid value' });
      }

      const row = trimmedCoordinate[0];
      const column = trimmedCoordinate.slice(1);
      const rowIndex = solver.rowToIndex(row);
      const columnIndex = solver.columnToIndex(column);

      if (rowIndex === null || columnIndex === null) {
        return res.json({ error: 'Invalid coordinate' });
      }

      const currentValue = puzzle[rowIndex * solver.SIZE + columnIndex];

      const conflicts = [];

      if (currentValue !== value) {
        if (!solver.checkRowPlacement(puzzle, row, column, value)) {
          conflicts.push('row');
        }

        if (!solver.checkColPlacement(puzzle, row, column, value)) {
          conflicts.push('column');
        }

        if (!solver.checkRegionPlacement(puzzle, row, column, value)) {
          conflicts.push('region');
        }
      }

      if (conflicts.length) {
        return res.json({ valid: false, conflict: conflicts });
      }

      return res.json({ valid: true });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body || {};

      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }

      const validation = solver.validate(puzzle);

      if (!validation.valid) {
        return res.json({ error: validation.error });
      }

      const solution = solver.solve(puzzle);

      if (!solution) {
        return res.json({ error: 'Puzzle cannot be solved' });
      }

      return res.json({ solution });
    });
};
