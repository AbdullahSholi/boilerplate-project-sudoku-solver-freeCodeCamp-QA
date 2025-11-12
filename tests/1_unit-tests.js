const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

suite('Unit Tests', () => {
  let solver;

  suiteSetup(() => {
    solver = new Solver();
  });

  test('Logic handles a valid puzzle string of 81 characters', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const result = solver.validate(puzzle);
    assert.deepEqual(result, { valid: true });
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....X.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const result = solver.validate(puzzle);
    assert.deepEqual(result, { valid: false, error: 'Invalid characters in puzzle' });
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37';
    const result = solver.validate(puzzle);
    assert.deepEqual(result, { valid: false, error: 'Expected puzzle to be 81 characters long' });
  });

  test('Logic handles a valid row placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isTrue(solver.checkRowPlacement(puzzle, 'A', '2', '3'));
  });

  test('Logic handles an invalid row placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isFalse(solver.checkRowPlacement(puzzle, 'A', '1', '2'));
  });

  test('Logic handles a valid column placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isTrue(solver.checkColPlacement(puzzle, 'B', '1', '6'));
  });

  test('Logic handles an invalid column placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isFalse(solver.checkColPlacement(puzzle, 'B', '1', '4'));
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isTrue(solver.checkRegionPlacement(puzzle, 'B', '2', '4'));
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isFalse(solver.checkRegionPlacement(puzzle, 'A', '1', '5'));
  });

  test('Valid puzzle strings pass the solver', () => {
    const [puzzle, solution] = puzzlesAndSolutions[0];
    const solved = solver.solve(puzzle);
    assert.equal(solved, solution);
  });

  test('Invalid puzzle strings fail the solver', () => {
    const puzzle = '9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9';
    const solved = solver.solve(puzzle);
    assert.isNull(solved);
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const [puzzle, solution] = puzzlesAndSolutions[1];
    const solved = solver.solve(puzzle);
    assert.equal(solved, solution);
  });
});
