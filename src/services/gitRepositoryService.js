const GitRepository = require("../models/gitRepository");
const { gitMasterColumns } = require("../constants/tableColumns");
const { encryptData, decryptData } = require("../util/decode");
const _ = require("lodash");

const getAllGitRecords = async (req, res) => {

    let response = await GitRepository.findAll( {
        where: {},
        attributes: _.without(gitMasterColumns, 'gr_client_secret', 'gr_iv_salt')
    })

    if (!response) {
        return res.status(400).json({ message: "No Git Records to show"})
    }
    return res.status(200).json({ data: response});
}


const getGitRecordById = async (req, res, grId) => {
    let response = await GitRepository.findOne( {
        where: { gr_id: grId},
        attributes: gitMasterColumns
    })

    if (!response) {
        return res.status(400).json({ message: "No data for given gr_id"})
    }
    response.gr_client_secret = decryptData( response.gr_client_secret);
    return res.status(200).json({ data: response});

}

const removeGitRecord = async (req, res, grId) => {
    const gitRecord = await GitRepository.findByPk(grId);
    if (!gitRecord) {
      res.status(404).json({ error: 'Git Record not found' });
    } else {
      await gitRecord.destroy();
      res.status(204).end();
    }
}

const addGitRecord = async ( req, res) => {
    try {
        let { 
          gr_name,
          gr_description,
          gr_environment_id,
          gr_host_url,
          gr_auth_method_id,
          gr_api_token,
          gr_client_secret,
          gr_client_id,
          gr_iv_salt,
          gr_state_id,
          created_by,
          modified_by
        } = req.body;

        let encryptedClientSecret = encryptData(gr_client_secret);

        const gitRecord = await GitRepository.create({ 
          gr_name,
          gr_description,
          gr_environment_id,
          gr_host_url,
          gr_auth_method_id,
          gr_api_token,
          gr_client_secret: encryptedClientSecret,
          gr_client_id,
          gr_iv_salt,
          gr_state_id,
          created_by,
          modified_by
        });
        res.status(201).json(gitRecord);
      } catch (error) {
        console.error('Error creating git Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

const updateGitRecord = async (req, res) => {
    const { gr_id } = req.body;
    console.log('gr_id: ', gr_id)
    try {
        const gitRecord = await GitRepository.findByPk(gr_id);
        if (!gitRecord) {
          res.status(404).json({ error: 'Git Record not found...' });
        } else {
          let {        
            gr_name,
            gr_description,
            gr_environment_id,
            gr_host_url,
            gr_auth_method_id,
            gr_api_token,
            gr_client_secret,
            gr_client_id,
            gr_iv_salt,
            gr_state_id,
            created_by,
            modified_by }= req.body;

          // not using gr_client_secret for now, instead using it from our .env
         // later on, use gr_client_secret
         let encryptedGrClientSecret = encryptData (gr_client_secret);
          await gitRecord.update({ 
            gr_name,
            gr_description,
            gr_environment_id,
            gr_host_url,
            gr_auth_method_id,
            gr_api_token,
            gr_client_secret: encryptedGrClientSecret,
            gr_client_id,
            gr_iv_salt,
            gr_state_id,
            created_by,
            modified_by
           });
          res.json(gitRecord);
        }
      } catch (error) {
        console.error('Error updating git Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

}

module.exports = {
    getAllGitRecords,
    getGitRecordById,
    removeGitRecord,
    addGitRecord,
    updateGitRecord
}