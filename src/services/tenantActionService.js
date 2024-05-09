const { HttpStatusCode } = require("axios");
const Tenant = require("../models/tenant");
const { getOAuth } = require("../util/auth");

const checkTenantConnection = async (req, res, tenantId) => {
    const response = await Tenant.findByPk( tenantId );

    if (!response) {
        return res.status(HttpStatusCode.NotFound).json({ error: `Tenant id : ${tenantId} not found`})
    }
    console.log('\nTenant found')
    console.log('Response data: ', JSON.parse(JSON.stringify(response)));

    let inputCredentials = {
         tokenEndpoint : response.tenant_host_url,
         clientId : response.tenant_host_username, 
         clientSecret : response.tenant_host_password, // this is to be again decrypted
    }

    try {
        let bearerToken = await getOAuth(inputCredentials);
        if (!bearerToken || bearerToken === null) {
            // status code could be decided
            // simulate failure for Tenant connection not OK
            return res.status(HttpStatusCode.NotFound).json({ success: false})
        }
        if (bearerToken) {
            return res.status(HttpStatusCode.Ok).json({ success: true})
        }

    } catch(error) {
        console.log('Error in checkTenantConnection Service: ', error);
        return res.status(HttpStatusCode.InternalServerError).json({ success: false })
    }
} 

module.exports = {
    checkTenantConnection
}