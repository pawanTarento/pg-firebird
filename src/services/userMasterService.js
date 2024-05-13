const UserModel = require("../models/userModel");
const { userMasterColumns } = require("../constants/tableColumns");

// done
const getAllUserRecords = async (req, res) => {

    let response = await UserModel.findAll( {
        where: {},
        attributes: userMasterColumns,
    })

    if (!response) {
        return res.status(400).json({ message: "No User Records to show"})
    }
    return res.status(200).json({ data: response });
}

// done
const getUserRecordByUserId = async (req, res, userId) => {
    console.log('User Record By User Id');
    let response = await UserModel.findOne( {
        where: { userId: userId },
        attributes: userMasterColumns
    })

    if ( !response) {
        return res.status(400).json({ message: "No data for given userId"})
    }
    return res.status(200).json({ data: response});
  
}

const getUserRecordById = async (req, res, id) => {
    let response = await UserModel.findOne( {
        where: { user_id: id },
        attributes: userMasterColumns
    })

    if (!response) {
        return res.status(400).json({ message: "No data for given id"})
    }
    return res.status(200).json({ data: response});

}

const removeUserRecord = async (req, res, id) => {
    const userRecord = await UserModel.findByPk(id);
    if (!userRecord) {
      res.status(404).json({ error: 'User Record not found' });
    } else {
      await userRecord.destroy();
      res.status(204).end();
    }
}

const addUserRecord = async ( req, res) => {
    try {
        const { 
            email_id,
            firstname,
            lastname,
            display_name,
            external_id,
            is_active,
            additional_param1,
            role,
            isAdmin
        } = req.body;

        const userRecord = await UserModel.create({ 
        
            email_id,
            firstname,
            lastname,
            display_name,
            external_id,
            is_active,
            additional_param1,
            role,
            isAdmin
        });
        res.status(201).json(userRecord);
      } catch (error) {
        console.error('Error creating user Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

const updateUserRecord = async (req, res) => {
    const { user_id } = req.body;
    console.log('ID: ', user_id)
    try {
        const userRecord = await UserModel.findByPk(user_id);
        if (!userRecord) {
          res.status(404).json({ error: 'User Record not found...' });
        } else {
          const {    
            user_id,
            email_id,
            firstname,
            lastname,
            display_name,
            external_id,
            is_active,
            additional_param1,
            role,
            isAdmin }= req.body;
          await userRecord.update({    
            user_id,
            email_id,
            firstname,
            lastname,
            display_name,
            external_id,
            is_active,
            additional_param1,
            role,
            isAdmin });
          res.json(userRecord);
        }
      } catch (error) {
        console.error('Error updating user Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

}

module.exports = {
    getAllUserRecords,
    getUserRecordByUserId,
    getUserRecordById,
    removeUserRecord,
    addUserRecord,
    updateUserRecord
}