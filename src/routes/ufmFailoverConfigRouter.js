const express = require('express');
const router = express.Router();
const ufmFailoverConfigController = require('../controllers/ufmFailoverConfigController');

router.route('/')
    .get( ufmFailoverConfigController.getAllFailoverConfigRecords)
    .post(ufmFailoverConfigController.createFailoverConfigRecord)
    .put( ufmFailoverConfigController.updateFailoverConfigRecord)


router.route("/:configId") 
    .get( ufmFailoverConfigController.getFailoverConfigRecord)
    .delete(ufmFailoverConfigController.removeFailoverConfigRecord)

module.exports = router;