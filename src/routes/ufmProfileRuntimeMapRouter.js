const express = require('express');
const router = express.Router();
const ufmProfileRuntimeMapController = require('../controllers/ufmProfileRuntimeMapController');

router.route('/')
    .get( ufmProfileRuntimeMapController.getAllUfmProfileRuntimeRecords)
    .post(ufmProfileRuntimeMapController.addUfmProfileRuntimeRecord)
    .put( ufmProfileRuntimeMapController.updateUfmProfileRuntimeRecord);

router.route("/:ufmProfileId") 
    .get( ufmProfileRuntimeMapController.getUfmProfileRuntimeByUfmProfileId)

router.route("/:ufmProfileRuntimeMapId")
    .delete(ufmProfileRuntimeMapController.removeUfmProfileRuntimeRecord);

module.exports = router;
