// userModel.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbconfig/config');

class UserModel extends Model {}

UserModel.init({
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    externalId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    firstLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    timeZone: { // doubt in this 
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'UserMaster',
    tableName: 'UserMaster',
    timestamps: true // If you want Sequelize to not automatically manage createdAt and updatedAt columns
});

module.exports = UserModel;

// UserModel.sync({ force: false });
