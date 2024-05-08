// tenant.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbconfig/config');

class UFMProfile extends Model {}

UFMProfile.init({
    ufm_profile_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ufm_profile_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    ufm_profile_environment_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ufm_profile_primary_tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ufm_profile_secondary_tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ufm_profile_gr_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ufm_profile_tenant_state_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'UFMProfile',
    tableName: 'ufm_profile',
    createdAt: 'created_on', 
    updatedAt: 'modified_on', // check whether it is being updated properly in a put call
    timestamps: true 
});

module.exports = UFMProfile;

// UFMProfile.sync({ force: false })


