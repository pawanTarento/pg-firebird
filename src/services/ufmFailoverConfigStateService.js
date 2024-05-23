const { UFMFailoverConfigStateTableColumns, UFMFailoverConfigTableColumns } = require("../constants/tableColumns");
const UFMFailoverConfig = require("../models/UFM/ufmFailoverConfig");
const UFMFailoverConfigState = require("../models/UFM/ufmFailoverConfigState");
const  sequelize  = require("../dbconfig/config");


const addFailoverConfigStateRecord = async (req, res) => {
    const { payload } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const { ufmProfileId, configs } = payload;
       
        await UFMFailoverConfigState.update(
            { is_last_record: false },
            { where: { ufm_profile_id: ufmProfileId, is_last_record: true }, transaction }
          );

          const newConfigState = await UFMFailoverConfigState.create({
            ufm_profile_id:ufmProfileId,
            short_comment: 'New state',
            is_last_record: true,
            created_by: 999, // Replace with actual user ID from payload or context
            config_state_saved_on: Math.floor(Date.now() / 1000)
          }, { transaction });

          console.log('newConfigState:',newConfigState)
          
        // Step 3: Insert associated UFMFailoverConfig records
        const newConfigs = configs.map(config => ({
            ...config,
            config_state_id: newConfigState.config_state_id,
            config_timestamp: Math.floor(Date.now() / 1000),
            config_component_created_by: 1, // Replace with actual user ID from payload or context
            config_component_created_on: Math.floor(Date.now() / 1000),
            config_component_modified_on: Math.floor(Date.now() / 1000)
        }));
        console.log('newConfigs: ', newConfigs);
    
        await UFMFailoverConfig.bulkCreate(newConfigs, { transaction });
    
        await transaction.commit();
        console.log('Transaction: ', transaction);
        return res.status(200).json({message: "Config setting saved successfully."})

    }catch(error) {
        await transaction.rollback();
        console.error('Error creating UFMFailoverConfigState and UFMFailoverConfig instances:', error);
        return res.status(500).json({message: "Config setting saved successfully."})
    }

}

const modifyFailoverConfigStateRecord = (req, res) => {
    return res.status(200).json({message: "Hello, World! from modifyFailoverConfigStateRecord"});

}

const deleteFailoverConfigStateRecord = async (req, res, configStateId) => {

    try{
        const response = await UFMFailoverConfigState.findByPk(configStateId);
        if (!response) {
          res.status(404).json({ error: 'configStateId not found for deletion' });
        } else {
          await response.destroy();
          res.status(204).end();
        }
    } catch(error) {
        console.log('Error in service function: deleteFailoverConfigStateRecord: ', error);
    }

}

const allFailoverConfigStateRecords = async (req, res) => {
    try {
        let response = await UFMFailoverConfigState.findAll({
            where: {
                is_last_record: true
            },
            attributes: UFMFailoverConfigStateTableColumns,
            include: [
                {
                    model: UFMFailoverConfig,
                    attributes: UFMFailoverConfigTableColumns
                }
            ]
        });
        if (!response) {
            return res.status(200).json({ message: "No records for failover config state"})
        }
        
        return res.status(200).json({data: response});

    } catch(error) {
        console.log('Error in service function: AllFailoverConfigStateRecords: ', error);
    }

}

const getSingleFailoverConfigStateRecord = async (req, res,ufmProfileId) => {
    try {
        let response = await UFMFailoverConfigState.findOne({
            where: {
                ufm_profile_id: ufmProfileId, 
                is_last_record: true
            },
            attributes: UFMFailoverConfigStateTableColumns,
            include: [
            {
                model: UFMFailoverConfig,
                attributes: UFMFailoverConfigTableColumns
            }
        ]
        });
        if (!response) {
            return res.status(200).json({ message: "No record for failover config state Id"})
        }
        
        return res.status(200).json({data: response});

    } catch(error) {
        console.log('Error in service function: getSingleFailoverConfigStateRecord: ', error);
    }

}

module.exports = {
    addFailoverConfigStateRecord,
    modifyFailoverConfigStateRecord,
    deleteFailoverConfigStateRecord,
    allFailoverConfigStateRecords,
    getSingleFailoverConfigStateRecord
}
