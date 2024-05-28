// tenant.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbconfig/config');
const UFMProfile = require('./ufmProfile');

class Tenant extends Model {}

Tenant.init({
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    tenant_description: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    tenant_region_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tenant_host_url: {
        type: DataTypes.STRING(2048),
        allowNull: true
    },
    tenant_host_username: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    tenant_host_token_api: {
        type: DataTypes.STRING(2048),
        allowNull: true
    },
    tenant_host_password: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    tenant_iv_salt: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    tenant_host_test_status_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tenant_host_test_status_on: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tenant_environment_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tenant_state_id: {
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
    },
    created_on: {
        type: DataTypes.BIGINT,
        allowNull: true, 
        defaultValue: () => Math.floor(Date.now() / 1000)
    },
    modified_on: {
        type: DataTypes.BIGINT,
        allowNull: true, 
        defaultValue: () => Math.floor(Date.now() / 1000)
    }
}, {
    sequelize,
    modelName: 'Tenant',
    tableName: 'Tenant',
    createdAt: 'created_on', 
    updatedAt: 'modified_on', 
    timestamps: true, // If you want Sequelize to not automatically manage createdAt and updatedAt columns
    hooks: {
        beforeCreate: (record) => {
            record.created_on = Math.floor(Date.now() / 1000);
            record.modified_on = Math.floor(Date.now() / 1000);
        },
        beforeUpdate: (record) => {
            record.modified_on = Math.floor(Date.now() / 1000);
        }
    }
});

module.exports = Tenant;

// Tenant.sync({ force: true })

UFMProfile.belongsTo( Tenant, {foreignKey: "ufm_profile_primary_tenant_id", as: "ufm_profile_primary_tenant" });
UFMProfile.belongsTo( Tenant, {foreignKey: "ufm_profile_secondary_tenant_id", as: "ufm_profile_secondary_tenant" });

