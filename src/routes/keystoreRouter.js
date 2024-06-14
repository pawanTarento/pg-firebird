const express = require('express');
const router = express.Router();
const keystoreController = require('../controllers/keystoreController');

router.route('/list/:tenantOneId/:tenantTwoId')
    .get(keystoreController.getAllKeystoreEntriesForTenants);

router.route('/certificate')
    .post( keystoreController.copyCertificatesFromSourceToTargetTenant);


module.exports = router;