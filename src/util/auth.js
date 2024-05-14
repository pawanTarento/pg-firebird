const axios = require("axios");

// Later on -> rename this function
async function getOAuth(inputCredentials) {
    const tokenEndpoint = inputCredentials.tokenEndpoint;
    const clientId = inputCredentials.clientId; 
    const clientSecret = inputCredentials.clientSecret;

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
        tokenEndpoint : 'https://86f3b06dtrial.authentication.us10.hana.ondemand.com/oauth/token',
        clientId :"sb-107e31d3-80ed-4663-863b-af7d672634c1!b271192|it!b55215",
        clientSecret :"3bdc2367-7424-45fd-a884-d103d3d107c7$nuXvat1VnDqVUcqbF_3WXUQ61_jKY8K7RFz5lU7NCcs=",
    }
    let bearerToken = await getOAuth(tenantOneCredential);
    return bearerToken;
}

async function getOAuthTenantTwo() {
    const tenantTwoCredential = {
        tokenEndpoint : 'https://ad58f2f9trial.authentication.us10.hana.ondemand.com/oauth/token',
        clientId :'sb-65ced0d0-097c-45d2-a2db-d4cbcc8d867c!b259660|it!b55215',
        clientSecret :'f68ef290-e966-4868-89aa-d9954e4eb5d2$2HZmLOwC5riveeM4CmuKfQjxiPn3Axdan5-0aig6EVU=',
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