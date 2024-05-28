const UFMProfile = require("../models/ufmProfile");
const { ufmProfileColumns, gitMasterColumns } = require("../constants/tableColumns");
const Tenant = require("../models/tenant");
const GitRepository = require("../models/gitRepository");

const getAllUfmRecords = async (req, res) => {

    let response = await UFMProfile.findAll( {
        where: {},
        attributes: ufmProfileColumns,
        include: [
        {
          model: Tenant,
          "as": "ufm_profile_primary_tenant",
          attributes: [
            "tenant_id",
            "tenant_name",
            "tenant_description",
          ]
        },
        {
          model: Tenant,
          "as": "ufm_profile_secondary_tenant",
          attributes: [
            "tenant_id",
            "tenant_name",
            "tenant_description",
          ]
        },
        {
          model: GitRepository,
          attributes:[
            "gr_id",
            "gr_owner_name",
            "gr_name",
            "gr_description",
          ]
        }
      ]
    })

    if (!response) {
        return res.status(400).json({ message: "No Ufm Profile records to show"})
    }
    return res.status(200).json({ data: response });
}

const getUfmRecordById = async (req, res, ufmProfileId) => {
    let response = await UFMProfile.findOne( {
        where: { ufm_profile_id: ufmProfileId },
        attributes: ufmProfileColumns,
        include: [
          {
            model: Tenant,
            "as": "ufm_profile_primary_tenant",
            attributes: [
              "tenant_id",
              "tenant_name",
              "tenant_description",
            ]
          },
          {
            model: Tenant,
            "as": "ufm_profile_secondary_tenant",
            attributes: [
              "tenant_id",
              "tenant_name",
              "tenant_description",
            ]
          },
          {
            model: GitRepository,
            attributes: [
              "gr_id",
              "gr_owner_name",
              "gr_name",
              "gr_description",
            ]
          }
        ]
    })

    if (!response) {
        return res.status(400).json({ message: "No data for given UFM Profile id"})
    }
    return res.status(200).json({ data: response});

}

const removeUfmRecord = async (req, res, ufmProfileId) => {
    const ufmProfileRecord = await UFMProfile.findByPk(ufmProfileId);
    if (!ufmProfileRecord) {
      res.status(404).json({ error: 'UFM Profile Record not found' });
    } else {
      await ufmProfileRecord.destroy();
      res.status(204).end();
    }
}

const addUfmRecord = async ( req, res) => {
    try {
        const { 
          ufm_profile_name,
          ufm_profile_environment_id,
          ufm_profile_primary_tenant_id, 
          ufm_profile_secondary_tenant_id,
          ufm_profile_gr_id,
          ufm_profile_tenant_state_id,
          created_by,
          modified_by
        } = req.body;

        const ufmProfileRecord = await UFMProfile.create({ 
          ufm_profile_id,
          ufm_profile_name,
          ufm_profile_environment_id,
          ufm_profile_primary_tenant_id, 
          ufm_profile_secondary_tenant_id,
          ufm_profile_gr_id,
          ufm_profile_tenant_state_id,
          created_by,
          modified_by
        });
        res.status(201).json(ufmProfileRecord);
      } catch (error) {
        console.error('Error creating UFM Profile Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

const updateUfmRecord = async (req, res) => {
    const { ufm_profile_id } = req.body;
    console.log('ufmProfileId: ', ufm_profile_id)
    try {
        const ufmProfileRecord = await UFMProfile.findByPk(ufm_profile_id);
        if (!ufmProfileRecord) {
          res.status(404).json({ error: 'UFM Profile record not found...' });
        } else {
          const { 
            ufm_profile_id,
            ufm_profile_name,
            ufm_profile_environment_id,
            ufm_profile_primary_tenant_id, 
            ufm_profile_secondary_tenant_id,
            ufm_profile_gr_id,
            ufm_profile_tenant_state_id,
            created_by,
            modified_by
          }= req.body;
          await ufmProfileRecord.update({ 
            ufm_profile_id,
            ufm_profile_name,
            ufm_profile_environment_id,
            ufm_profile_primary_tenant_id, 
            ufm_profile_secondary_tenant_id,
            ufm_profile_gr_id,
            ufm_profile_tenant_state_id,
            created_by,
            modified_by
           });
          res.json(ufmProfileRecord);
        }
      } catch (error) {
        console.error('Error updating UFM Profile Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

}

module.exports = {
    getAllUfmRecords,
    addUfmRecord,
    removeUfmRecord,
    getUfmRecordById,
    updateUfmRecord
}