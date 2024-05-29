const ufmProfileRuntimeService = require("../services/ufmProfileRuntimeMapService")
const getAllUfmProfileRuntimeRecords = (req,res) => {
    try{
        ufmProfileRuntimeService.getAllUfmRuntimeRecords(req,res)
     
    } catch(error) {
        console.log('Error in controller -> getAllUfmProfileRuntimeRecords: ', error)
    }
}

const addUfmProfileRuntimeRecord = (req, res) => {
    try{
        ufmProfileRuntimeService.addUfmRuntimeRecord(req,res)
      
    } catch(error) {
        console.log('Error in controller -> addUfmProfileRuntimeRecord: ', error)
    }
}

const removeUfmProfileRuntimeRecord = (req, res) => {
    const ufmProfileRuntimeMapId = req.params.ufmProfileRuntimeMapId;
    try{
        ufmProfileRuntimeService.removeUfmRuntimeRecord(req, res, ufmProfileRuntimeMapId)
       
    } catch(error) {
        console.log('Error in controller -> removeUfmProfileRuntimeRecord: ', error)
    }
}
const getUfmProfileRuntimeByUfmProfileId = ( req, res) => {
    try{
        ufmProfileRuntimeService.getUfmRuntimeRecordByUfmProfileId(req,res)
    } catch(error) {
        console.log('Error in controller -> getUfmProfileRuntimeById: ', error)
    }
}
const updateUfmProfileRuntimeRecord = (req, res) => {
    try{
        ufmProfileRuntimeService.updateUfmRuntimeRecord(req,res)
    } catch(error) {
        console.log('Error in controller -> updateUfmProfileRuntimeRecord: ', error)
    }
}

module.exports = {
    getAllUfmProfileRuntimeRecords,
    addUfmProfileRuntimeRecord,
    removeUfmProfileRuntimeRecord,
    getUfmProfileRuntimeByUfmProfileId,
    updateUfmProfileRuntimeRecord
}