const { ufmProfileColumns, UFMProfileRuntimeTableColumns } = require("../constants/tableColumns");
const UFMProfileRuntimeMap = require("../models/UFM/ufmProfileRuntimeMap");
const UFMProfile = require("../models/ufmProfile");

// We are doing a soft delete in case of UFM profile runtime map table, so is_deleted: false by default

const getAllUfmRuntimeMapRecords = async (req, res) => {
    try {

     let response  = await UFMProfileRuntimeMap.findAll({
        where: { is_deleted: false },
        attributes: UFMProfileRuntimeTableColumns,
        include: [
            {
                model: UFMProfile,
                attributes: ufmProfileColumns
            }
        ]
     });

     if(!response) {
        return res.status(404).json({ error: "No data for the UFM profile runtime"})
     }

     return res.status(200).json({ data: response})
    } catch(error) {
        console.log('Error in service fn: getAllUfmRuntimeMapRecords', error);
    }
}

const addUfmRuntimeMapRecord = async (req, res) => {
    try {
        const { 
            ufm_profile_id,
            primary_runtime_id,
            primary_runtime_display_name,
            primary_runtime_type,
            primary_runtime_type_id,
            primary_runtime_state,
            secondary_runtime_id,
            secondary_runtime_display_name,
            secondary_runtime_type,
            secondary_runtime_type_id,
            secondary_runtime_state,
            created_by,
            modified_by
        } = req.body;

        const ufmProfileRuntimeRecord = await UFMProfileRuntimeMap.create({ 
            ufm_profile_id,
            primary_runtime_id,
            primary_runtime_display_name,
            primary_runtime_type,
            primary_runtime_type_id,
            primary_runtime_state,
            secondary_runtime_id,
            secondary_runtime_display_name,
            secondary_runtime_type,
            secondary_runtime_type_id,
            secondary_runtime_state,
            created_by,
            modified_by
        });
        res.status(201).json(ufmProfileRuntimeRecord);
      } catch (error) {
        console.error('Error creating UFM Profile Runtime Map Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

// Doing a soft delete in this function
const removeUfmRuntimeMapRecord = async (req, res, ufmProfileRuntimeMapId) => {

    console.log('ufmProfileRuntimeMapId: ', ufmProfileRuntimeMapId)
    try {
        const ufmProfileRuntimeRecord = await UFMProfileRuntimeMap.findOne({
          where: { 
            ufm_profile_runtime_map_id: ufmProfileRuntimeMapId, 
            is_deleted: false
        } });

        if (!ufmProfileRuntimeRecord) {
          res.status(404).json({ error: 'UFM Profile Runtime record not found...' });
        } else {

          await ufmProfileRuntimeRecord.update({ 
            is_deleted: true
           });
        //   res.json(ufmProfileRuntimeRecord);
        return res.status(204).json({ message: "UFM Profile Runtime record data deleted successfully."})
        }
      } catch (error) {
        console.error('Error in Deleting UFM Profile Runtime Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

}

const getUfmRuntimeMapRecordByUfmProfileId = async (req, res) => {
    const ufmProfileId = req.params.ufmProfileId;
    console.log('ufmProfileId: ', ufmProfileId);
    try {

            // let response  = await UFMProfileRuntimeMap.findAll({
            //    where: {
            //     ufm_profile_id: ufmProfileId
            //    },
            //    attributes: UFMProfileRuntimeTableColumns,
            //    include: [
            //        {
            //            model: UFMProfile,
            //            attributes: ufmProfileColumns
            //        }
            //    ]
            // });

            // This code block will send 
            let response  = await UFMProfile.findAll({
               where: {
                ufm_profile_id: ufmProfileId
               },
               attributes: ufmProfileColumns,
               include: [
                   {
                       model: UFMProfileRuntimeMap,
                       where: { is_deleted: false},
                       attributes: UFMProfileRuntimeTableColumns
                   }
               ]
            });
       
            if(!response) {
               return res.status(404).json({ error: "No data for the UFM profile runtime"})
            }
       
            return res.status(200).json({ data: response })
        
    } catch(error) {
        console.log('Error in service fn: getUfmRuntimeMapRecordByUfmProfileId', error);
    }
}

const updateUfmRuntimeMapRecord = async (req, res, ) => {
 
        const { ufm_profile_runtime_map_id } = req.body;
        console.log('ufm_profile_runtime_map_id: ', ufm_profile_runtime_map_id);
        try {
            const ufmProfileRuntimeRecord = await UFMProfileRuntimeMap.findOne({
                where: { 
                    ufm_profile_runtime_map_id: ufm_profile_runtime_map_id, 
                    is_deleted: false
                },
              });
            if (!ufmProfileRuntimeRecord) {
              res.status(404).json({ error: 'UFM Profile Runtime Map record not found...' });
            } else {
              const { 
                ufm_profile_id,
                primary_runtime_id,
                primary_runtime_display_name,
                primary_runtime_type,
                primary_runtime_type_id,
                primary_runtime_state,
                secondary_runtime_id,
                secondary_runtime_display_name,
                secondary_runtime_type,
                secondary_runtime_type_id,
                secondary_runtime_state,
                created_by,
                modified_by
              }= req.body;

              await ufmProfileRuntimeRecord.update({ 
                ufm_profile_id,
                primary_runtime_id,
                primary_runtime_display_name,
                primary_runtime_type,
                primary_runtime_type_id,
                primary_runtime_state,
                secondary_runtime_id,
                secondary_runtime_display_name,
                secondary_runtime_type,
                secondary_runtime_type_id,
                secondary_runtime_state,
                created_by,
                modified_by
               });
              res.json(ufmProfileRuntimeRecord);
            }
          } catch (error) {
            console.error('Error updating UFM Profile Runtime Map Record:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
}


module.exports = {
    getAllUfmRuntimeMapRecords,
    addUfmRuntimeMapRecord,
    removeUfmRuntimeMapRecord,
    getUfmRuntimeMapRecordByUfmProfileId,
    updateUfmRuntimeMapRecord
}