// require routes
const router = require('express').Router();
const userRoutes = require('./userRoutes');
const BucketRoutes = require('./BucketRoutes');

router.use('/users', userRoutes);
router.use('/bucket', BucketRoutes);

module.exports = router;
