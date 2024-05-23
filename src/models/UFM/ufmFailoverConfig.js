const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../dbconfig/config');
const UFMProfile = require('../ufmProfile');

class UFMFailoverConfig extends Model {}

UFMFailoverConfig.init({
    config_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    config_state_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ufm_profile_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    config_component_row_select: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    config_component_group_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    config_component_group_order: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    config_component_position: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    config_component_version: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    config_component_name: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    config_component_id: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    config_component_package_id: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    config_component_resource_id: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    config_component_description: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    config_component_short_text: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    config_component_mode: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    config_component_created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    config_component_created_on: {
        type: DataTypes.BIGINT,
        allowNull: true, 
        defaultValue: () => Math.floor(Date.now() / 1000),
        get() {
            const rawValue = this.getDataValue('config_component_created_on');
            return rawValue ? new Date(rawValue * 1000).toISOString() : null;
        },
    },
    config_component_modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    config_component_modified_on: {
        type: DataTypes.BIGINT,
        allowNull: true, 
        defaultValue: () => Math.floor(Date.now() / 1000),
        get() {
            const rawValue = this.getDataValue('config_component_modified_on');
            return rawValue ? new Date(rawValue * 1000).toISOString() : null;
        },
    },
    config_timestamp: {
        type: DataTypes.BIGINT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('config_timestamp');
            return rawValue ? new Date(rawValue * 1000).toISOString() : null;
        },
    },
    is_draft: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }, 
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'UFMFailoverConfig',
    tableName: 'ufm_failover_config',
    createdAt: 'config_component_created_on', 
    updatedAt: 'config_component_modified_on', 
    timestamps: true,
    hooks: {
        beforeCreate: (record) => {
            record.config_component_created_on = Math.floor(Date.now() / 1000);
            record.config_component_modified_on = Math.floor(Date.now() / 1000);
        },
        beforeUpdate: (record) => {
            record.config_component_modified_on = Math.floor(Date.now() / 1000);
        }
    }

});

module.exports = UFMFailoverConfig;
