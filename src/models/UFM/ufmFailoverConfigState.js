const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../dbconfig/config');
const UFMFailoverConfig = require('./ufmFailoverConfig');

class UFMFailoverConfigState extends Model {}

UFMFailoverConfigState.init({
    config_state_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ufm_profile_id: {
        type: DataTypes.INTEGER,
        allowNull: true // for now
    },
    config_state_saved_on: {
        type: DataTypes.BIGINT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('config_state_saved_on');
            return rawValue ? new Date(rawValue * 1000).toISOString() : null;
        },
    },
    short_comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_last_record: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    created_by : {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_on: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Math.floor(Date.now() / 1000), // Default to current epoch time
        get() {
            const rawValue = this.getDataValue('created_on');
            return rawValue ? new Date(rawValue * 1000).toISOString() : null;
        },
    },
    modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    modified_on: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Math.floor(Date.now() / 1000), // Default to current epoch time
        get() {
            const rawValue = this.getDataValue('modified_on');
            return rawValue ? new Date(rawValue * 1000).toISOString() : null;
        },
    }

}, {
    sequelize,
    modelName: 'UFMFailoverConfigState',
    tableName: 'ufm_failover_config_state',
    createdAt: 'created_on', 
    updatedAt: 'modified_on', 
    timestamps: true,
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

module.exports = UFMFailoverConfigState;

UFMFailoverConfigState.hasMany( UFMFailoverConfig, { foreignKey: 'config_state_id' });
UFMFailoverConfig.belongsTo(UFMFailoverConfigState, { foreignKey: 'config_state_id' });



