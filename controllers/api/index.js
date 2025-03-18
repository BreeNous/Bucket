// require routes
const router = require('express').Router();
const userRoutes = require('./userRoutes');
const myListRoutes = require('./myListRoutes');

router.use('/users', userRoutes);
router.use('/bucket', myListRoutes);

module.exports = router;
