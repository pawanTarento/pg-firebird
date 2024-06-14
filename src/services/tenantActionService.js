const { HttpStatusCode } = require("axios");
const Tenant = require("../models/tenant");
const { getOAuth } = require("../util/auth");
const { decryptData, getEncryptionIV } = require("../util/decode");
const  sequelize  = require("../dbconfig/config");
const { SUCCESSFUL_TEST_STATUS, UNSUCCESSFUL_TEST_STATUS } = require("../constants/taxonomyValues");

const checkTenantConnection = async (req, res, tenantId) => {
    const transaction = await sequelize.transaction();
    
    try {
        const response = await Tenant.findByPk(tenantId, { transaction });

        if (!response) {
            await transaction.rollback();
            return res.status(HttpStatusCode.NotFound).json({ error: `Tenant id : ${tenantId} not found`});
        }

        // console.log('\nTenant found');
        // console.log('Response data: ', JSON.parse(JSON.stringify(response)));

        let inputCredentials = {
             tokenEndpoint : response.tenant_host_token_api,
             clientId : response.tenant_host_username, 
             clientSecret : decryptData(response.tenant_host_password, getEncryptionIV( response.tenant_iv_salt) ), 
        }
        
        let bearerToken = await getOAuth(inputCredentials);
        console.log('Bearer token got: ', bearerToken)
        console.log()
        if (!bearerToken || bearerToken === null) {
            // Simulate failure for Tenant connection not OK
            await Tenant.update({ tenant_host_test_status_id:UNSUCCESSFUL_TEST_STATUS  }, {
                where: {
                    tenant_id: tenantId
                },
                transaction
            });
            await transaction.commit();
            return res.status(HttpStatusCode.Ok).json({ success: false});
        }

        if (bearerToken) {
            console.log('\nGot bearer token')
            await Tenant.update({ tenant_host_test_status_id: SUCCESSFUL_TEST_STATUS }, {
                where: {
                    tenant_id: tenantId
                },
                transaction
            });
            await transaction.commit();
            return res.status(HttpStatusCode.Ok).json({ success: true });
        }
        
    } catch(error) {
        console.log('Error in checkTenantConnection Service: ', error);
        await transaction.rollback();
        return res.status(HttpStatusCode.InternalServerError).json({ success: false });
    }
} 

module.exports = {
    checkTenantConnection
}