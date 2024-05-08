const express = require('express');
const router = express.Router();
const twoController = require('../controllers/gitActivityController');

router.route('/')
    .get( twoController.copyPackagesOnGitFromTenant)
    .post(twoController.downloadPackagesFromGitForTenant);


module.exports = router;