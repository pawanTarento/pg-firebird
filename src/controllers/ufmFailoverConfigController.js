const ufmFailoverConfigService  = require("../services/ufmFailoverConfigService");

const createFailoverConfigRecord = async (req, res) => {
    try {
        ufmFailoverConfigService.addFailoverConfigRecord(req,res)
     
    } catch(error) {
        console.log('Error in controller, createFailoverConfigRecord: ', error);
    }
}

const updateFailoverConfigRecord = async (req, res) => {
    try {
        ufmFailoverConfigService.modifyFailoverConfigRecord(req, res)

    } catch(error) {
        console.log('Error in controller, updateFailoverConfigRecord: ', error);

    }
}

const removeFailoverConfigRecord = async (req, res) => {
    try {
        ufmFailoverConfigService.deleteFailoverConfigRecord(req, res)
    
    } catch(error) {
        console.log('Error in controller, removeFailoverConfigRecord: ', error);

    }
}

const getFailoverConfigRecord = async(req, res) => {
    try {
        ufmFailoverConfigService.getSingleFailoverConfigRecord(req, res)
    } catch(error) {
        console.log('Error in controller, getFailoverConfigRecord: ', error);

    }
}

const getAllFailoverConfigRecords = async(req, res) => {
    try {
        ufmFailoverConfigService.  getAllFailoverConfigRecords(req, res)
    } catch(error) {
        console.log('Error in controller, getAllFailoverConfigRecords: ', error);

    }
}

module.exports = {
    createFailoverConfigRecord,
    updateFailoverConfigRecord,
    removeFailoverConfigRecord,
    getFailoverConfigRecord,
    getAllFailoverConfigRecords
}