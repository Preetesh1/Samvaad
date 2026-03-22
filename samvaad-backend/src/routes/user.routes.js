const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

module.exports = router;
