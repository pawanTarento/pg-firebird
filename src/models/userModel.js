// userModel.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbconfig/config');

class UserModel extends Model {}

UserModel.init({
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email_id: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    firstname: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    lastname: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    display_name: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    external_id: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    is_active: {
        type:DataTypes.BOOLEAN,
        allowNull: true
    },
    additional_param1: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'UserMaster',
    tableName: 'user_master',
    createdAt: 'created_on', 
    updatedAt: 'modified_on', 
    timestamps: true // If you want Sequelize to not automatically manage createdAt and updatedAt columns
});

module.exports = UserModel;

// UserModel.sync({ force: false });
