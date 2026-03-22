const router = require('express').Router();
const { createRoom, getRoom, joinRoom, leaveRoom, endRoom } = require('../controllers/room.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/', createRoom);
router.get('/:roomId', getRoom);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/leave', leaveRoom);
router.delete('/:roomId', endRoom);

module.exports = router;
