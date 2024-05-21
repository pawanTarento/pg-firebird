const ufmFailoverConfigStateService  = require("../services/ufmFailoverConfigStateService");

const createFailoverConfigStateRecord = async (req, res) => {
    try {
        ufmFailoverConfigStateService.addFailoverConfigStateRecord(req,res)
    } catch(error) {
        console.log('Error in controller, createFailoverConfigStateRecord: ', error);
    }
}

const updateFailoverConfigStateRecord = async (req, res) => {
    try {
        ufmFailoverConfigStateService.modifyFailoverConfigStateRecord(req, res)
    } catch(error) {
        console.log('Error in controller, updateFailoverConfigStateRecord: ', error);
    }
}

const removeFailoverConfigStateRecord = async (req, res) => {
    try {
        ufmFailoverConfigStateService.deleteFailoverConfigStateRecord(req,res)
    } catch(error) {
        console.log('Error in controller, removeFailoverConfigStateRecord: ', error);
    }
}

const getFailoverConfigStateRecord = async(req, res) => {
    try {
        ufmFailoverConfigStateService.getSingleFailoverConfigStateRecord(req, res)
    } catch(error) {
        console.log('Error in controller, getFailoverConfigStateRecord: ', error);
    }
}

const getAllFailoverConfigStateRecords = async(req, res) => {
    try {
        ufmFailoverConfigStateService.AllFailoverConfigStateRecords(req,res)
    } catch(error) {
        console.log('Error in controller, getAllFailoverConfigStateRecords: ', error);
    }    
}

module.exports = {
    createFailoverConfigStateRecord,
    updateFailoverConfigStateRecord,
    removeFailoverConfigStateRecord,
    getFailoverConfigStateRecord,
    getAllFailoverConfigStateRecords
}