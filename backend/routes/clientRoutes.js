const express = require('express');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  enrollClientInProgram,
  removeClientFromProgram,
  updateEnrollmentStatus
} = require('../controllers/clientController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All client routes are protected

router.route('/search')
  .get(searchClients);

router.route('/')
  .get(getClients)
  .post(createClient);

router.route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

router.route('/:id/programs')
  .post(enrollClientInProgram);

router.route('/:id/programs/:programId')
  .delete(removeClientFromProgram)
  .put(updateEnrollmentStatus);

module.exports = router;