const express = require('express');
const router = express.Router();
const integrationPackage = require('../controllers/integrationPackagesController');

router.route('/:tenantId')
    .get(integrationPackage.getAllPackagesList);

router.route("/sync/:tenantOneId/:tenantTwoId")
    .get(integrationPackage.getAllPackagesWithArtifactsInformation);

// router.route('/')
//     .get( integrationPackage.getAllEntries)
//     .post(integrationPackage.postEntry); // can post one or single integration package;

// router.route('/:id') 
//     .get( integrationPackage.getIntegrationPackageDetailsByPackageId);

// router.route('/download/:packageId')
//     .get( integrationPackage.downloadIntegrationPackageBlob)



module.exports = router;