// tenant.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbconfig/config');
const UFMFailoverConfigState = require('./UFM/ufmFailoverConfigState');
const Tenant = require('./tenant');
const UFMProfileRuntimeMap = require('./UFM/ufmProfileRuntimeMap');

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
    ufm_profile_environment_id: { // taxonomy
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
    updatedAt: 'modified_on', 
    timestamps: true 
});

module.exports = UFMProfile;

UFMProfile.hasMany(  UFMFailoverConfigState , { foreignKey: "ufm_profile_id"} );
UFMFailoverConfigState.belongsTo( UFMProfile,{ foreignKey: "ufm_profile_id"} );
UFMProfile.hasMany(UFMProfileRuntimeMap, {foreignKey: "ufm_profile_id"});
UFMProfileRuntimeMap.belongsTo( UFMProfile, { foreignKey: "ufm_profile_id"});

