// gitModel.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../dbconfig/config');

class GitRepository extends Model {}

GitRepository.init({
    gr_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    gr_name: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    gr_description: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    gr_environment_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    gr_host_url: {
        type: DataTypes.STRING(2048),
        allowNull: true
    },
    gr_auth_method_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    gr_api_token: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    gr_client_secret: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    gr_client_id: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    gr_iv_salt: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    gr_state_id: {
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
    modelName: 'git_repository',
    tableName: 'git_repository',
    createdAt: 'created_on', 
    updatedAt: 'modified_on', 
    timestamps: true // If you want Sequelize to not automatically manage createdAt and updatedAt columns
});

module.exports = GitRepository;

// GitRepository.sync({ force: false });
