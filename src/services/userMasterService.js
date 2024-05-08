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
        where: { Id: id },
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
            userId,
            externalId, 
            email, 
            role, 
            isAdmin, 
            firstLogin, 
            lastLogin,  
            timeZone 
        } = req.body;

        const userRecord = await UserModel.create({ 
            userId ,externalId, email, role, isAdmin, firstLogin, lastLogin,  timeZone
        });
        res.status(201).json(userRecord);
      } catch (error) {
        console.error('Error creating user Record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

const updateUserRecord = async (req, res) => {
    const { id } = req.body;
    console.log('ID: ', id)
    try {
        const userRecord = await UserModel.findByPk(id);
        if (!userRecord) {
          res.status(404).json({ error: 'User Record not found...' });
        } else {
          const { userId ,externalId, email, role, isAdmin, firstLogin, lastLogin,  timeZone }= req.body;
          await userRecord.update({ userId ,externalId, email, role, isAdmin, firstLogin, lastLogin, timeZone });
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