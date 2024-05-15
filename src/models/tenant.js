// tenant.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbconfig/config');

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
    }
}, {
    sequelize,
    modelName: 'Tenant',
    tableName: 'Tenant',
    createdAt: 'created_on', 
    updatedAt: 'modified_on', 
    timestamps: true // If you want Sequelize to not automatically manage createdAt and updatedAt columns
});

module.exports = Tenant;

// Tenant.sync({ force: true })


