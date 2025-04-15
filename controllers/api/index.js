// require routes
const router = require('express').Router();
const userRoutes = require('./userRoutes');
const myListRoutes = require('./myListRoutes');
const resetPwRoutes = require('./resetPwRoutes');

router.use('/reset', resetPwRoutes);
router.use('/users', userRoutes);
router.use('/bucket', myListRoutes);

module.exports = router;
