const router = require('express').Router();
const { apiLimiter } = require('../middleware/rateLimit.middleware');

router.use(apiLimiter);
router.use('/auth', require('./auth.routes'));
router.use('/rooms', require('./room.routes'));
router.use('/meetings', require('./meeting.routes'));
router.use('/users', require('./user.routes'));

module.exports = router;
