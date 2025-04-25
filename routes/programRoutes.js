const express = require('express');
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramStats
} = require('../controllers/programController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All program routes are protected

router.route('/stats')
  .get(getProgramStats);

router.route('/')
  .get(getPrograms)
  .post(createProgram);

router.route('/:id')
  .get(getProgram)
  .put(updateProgram)
  .delete(deleteProgram);

module.exports = router;