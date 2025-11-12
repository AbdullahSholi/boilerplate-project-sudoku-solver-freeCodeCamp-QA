const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('/api/solve', () => {
    test('Solve a puzzle with valid puzzle string', done => {
      const puzzle = puzzlesAndSolutions[0][0];
      const solution = puzzlesAndSolutions[0][1];

      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { solution });
          done();
        });
    });

    test('Solve a puzzle with missing puzzle string', done => {
      chai
        .request(server)
        .post('/api/solve')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Required field missing' });
          done();
        });
    });

    test('Solve a puzzle with invalid characters', done => {
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: '1.5..2.84..63.12.7.2..5.....9..1....X.2.3674.3.7.2..9.47...8..1..16....926914.37.' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
          done();
        });
    });

    test('Solve a puzzle with incorrect length', done => {
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
          done();
        });
    });

    test('Solve a puzzle that cannot be solved', done => {
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: '9'.repeat(81) })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });
          done();
        });
    });
  });

  suite('/api/check', () => {
    test('Check a puzzle placement with all fields', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: puzzlesAndSolutions[0][0], coordinate: 'A2', value: '3' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { valid: true });
          done();
        });
    });

    test('Check a puzzle placement with single placement conflict', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: puzzlesAndSolutions[0][0], coordinate: 'A2', value: '4' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isFalse(res.body.valid);
          assert.deepEqual(res.body.conflict, ['row']);
          done();
        });
    });

    test('Check a puzzle placement with multiple placement conflicts', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: puzzlesAndSolutions[0][0], coordinate: 'A2', value: '6' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isFalse(res.body.valid);
          assert.sameMembers(res.body.conflict, ['column', 'region']);
          done();
        });
    });

    test('Check a puzzle placement with all placement conflicts', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: puzzlesAndSolutions[0][0], coordinate: 'A2', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isFalse(res.body.valid);
          assert.sameMembers(res.body.conflict, ['row', 'column', 'region']);
          done();
        });
    });

    test('Check a puzzle placement with missing required fields', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: puzzlesAndSolutions[0][0], coordinate: 'A1' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Required field(s) missing' });
          done();
        });
    });

    test('Check a puzzle placement with invalid characters', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: '1.5..2.84..63.12.7.2..5.....9..1....X.2.3674.3.7.2..9.47...8..1..16....926914.37.', coordinate: 'A1', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
          done();
        });
    });

    test('Check a puzzle placement with incorrect length', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37', coordinate: 'A1', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
          done();
        });
    });

    test('Check a puzzle placement with invalid placement coordinate', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: puzzlesAndSolutions[0][0], coordinate: 'Z9', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid coordinate' });
          done();
        });
    });

    test('Check a puzzle placement with invalid placement value', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: puzzlesAndSolutions[0][0], coordinate: 'A1', value: '0' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid value' });
          done();
        });
    });
  });
});

