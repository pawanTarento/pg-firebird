const express = require('express');
const router = express.Router();
const runtimeArtifactsController  = require('../controllers/runtimeArtifactsController');

router.route('/:tenantOneId/:tenantTwoId')
    .get( runtimeArtifactsController.getRuntimeArtifactsWithDesigntimeArtifacts )


module.exports = router;