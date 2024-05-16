const axios = require("axios");

// Later on -> rename this function
async function getOAuth(inputCredentials) {
    const { tokenEndpoint, clientId, clientSecret } = inputCredentials;
    // Encode client ID and client secret in Base64
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Try replacing this with our service
    try {
        const response = await axios.post(tokenEndpoint, null, {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded' // Required for token endpoint
            },
            params: {
                'grant_type': 'client_credentials'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}



async function getOAuthTenantOne() {
    const tenantOneCredential = {
        tokenEndpoint : "https://pgisqa2.authentication.us20.hana.ondemand.com/oauth/token",
        clientId :"sb-08c908ac-89f8-4ce2-918a-2f93e2da4f35!b12346|it!b34",
        clientSecret :"47810be4-309c-4296-b2ff-4596e090ad37$j_ExYphyBePaIte1PH7br85_LbbhgZka-QlaWc2G7i4=",
    }
    let bearerToken = await getOAuth(tenantOneCredential);
    return bearerToken;
}

async function getOAuthTenantTwo() {
    const tenantTwoCredential = {
        tokenEndpoint : 'https://tarentobtp.authentication.eu10.hana.ondemand.com/oauth/token',
        clientId :"sb-4580da99-af4a-4f4e-8faa-d570557797c9!b140765|it!b410603",
        clientSecret :"174f464d-a14e-45b3-a778-beb1c0b1dd6f$fzZyjMdgt4CiNwodlegN4_aAl_wEdIqQIaSLWFAsgmw=",
    }
    let bearerToken = await getOAuth(tenantTwoCredential);
    return bearerToken;
}

// DEPRECATED
// async function getOAuthGit (inputCredentials) {
//     let config = {
//         method: 'get',
//         url: inputCredentials.tokenEndpoint,
//         // Set the content type header, so that we get the response in JSON
//         headers: {
//              accept: 'application/json',
//              Authorization: `Bearer ${inputCredentials.clientSecret}`
//         }
//       }
//       console.log('Config: ', config)

//     let response = await axios(config)

//     if (response) {
//         console.log('Response: ',typeof response );
//         console.log('Response object: ',response );
//         return response
//     }
// }

module.exports = {
    getOAuthTenantOne,
    getOAuthTenantTwo,
    // getOAuthGit,
    getOAuth
}