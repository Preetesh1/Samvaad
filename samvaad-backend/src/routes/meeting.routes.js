const router = require('express').Router();
const { getMyMeetings, getMeetingById } = require('../controllers/meeting.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getMyMeetings);
router.get('/:id', getMeetingById);

module.exports = router;
