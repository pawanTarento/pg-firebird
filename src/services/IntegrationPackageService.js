const { axiosInstance } = require("./cpiClient");
const {getOAuthTenantOne,getOAuthTenantTwo, getOAuth} = require("../util/auth");
const {  encryptData, decryptData,getEncryptionIV } = require("../util/decode")
const axios = require("axios");
const Tenant = require("../models/tenant");

const baseURLTenantOne = "https://86f3b06dtrial.it-cpitrial06.cfapps.us10-001.hana.ondemand.com/api/v1";

/****************************** GET All Packages for a tenant ********************************* */
async function getIntegrationPackagesList(req, res, isFunctionCall=false) {
    const tenantId = req.params.tenantId;

    try {
        let tenantMasterResponse = await Tenant.findByPk(tenantId);

        if (!tenantMasterResponse) {
            return res.status(404).json({ error: `Tenant id:${tenantId} not found in Database`});
        }

        let authCredentials = {
            tokenEndpoint : tenantMasterResponse.tenant_host_token_api,
            clientId :  tenantMasterResponse.tenant_host_username,
            clientSecret : decryptData(tenantMasterResponse.tenant_host_password,getEncryptionIV ( tenantMasterResponse.tenant_iv_salt) ),
        }

        let tenantBearerToken = await getOAuth(authCredentials);

        if (!tenantBearerToken) {
            return res.status(404).json({ error: `Error in getting Bearer token for tenant:${tenantId}`});
        }
        let targetUrl = tenantMasterResponse.tenant_host_url+"/api/v1";
        console.log('TargetURL: ', targetUrl);

        let response = await axiosInstance({
            url: `${targetUrl}/IntegrationPackages`,
            token: tenantBearerToken
        }).get();

        if(!response) {
            return res.status(500).json({ message: "Error in fetching package record for tenant"})
        }
    
        if (!response.data.d.results.length) {
            return res.status(400).json({ message: "No integration packages are there"})
        }
        let integrationPackages = mapToIntegrationPackage(response.data.d.results);
        
        // In case the function is required again
        if (isFunctionCall) {
            return integrationPackages.map( package => package.Id)
        }
    
        return res.status(200).json( integrationPackages );


    } catch( error) {
        console.log('Error in getIntegrationPackagesList: ', error);
    }  
}

/****************************** GET Integration package by Id ********************************* */
// get this package by Id -> for tenant One
async function getIntegrationPackageById (req, res, integrationPackageId) {
    tenantOneToken = await getOAuthTenantOne();

    let response = await axiosInstance({
        url: `${baseURLTenantOne}/IntegrationPackages('${integrationPackageId}')`,
        timeout: 3000,
        token: tenantOneToken
    }).get();

    if(!response) {
        return res.status(500).json({ message: "Error in fetching package record for tenant"})
    }

    let integrationPackage = mapToIntegrationPackage(response.data.d);
    return res.status(200).json(integrationPackage);
}
/****************************** Post packages ********************************* */
async function postList(req, res, packageIds, overWrite) {
    let tenantOneToken = await getOAuthTenantOne();
    let tenantTwoToken = await getOAuthTenantTwo();

    // check in the list of source packages whether the requested packages from payload exist or not
    let allIntegrationPackages = await getIntegrationPackagesList(req, res, true);
    let unmatchedPackages = checkIfIntegrationPackagesAvailable(packageIds, allIntegrationPackages);
    if(unmatchedPackages.length) {
        return res.status(400).json({ error: "Some packages does not match", unmatchedPackages})
    }

    // copying the integration packages
    for (let i = 0; i < packageIds.length; i++) {
        // get the blob of the 
        let response = await axiosInstance({
            url: `${baseURLTenantOne}/IntegrationPackages('${packageIds[i]}')/$value`,
            timeout: 40000,
            token: tenantOneToken,
            responseType: 'arraybuffer'
        }).get();   

        try {

            let postRequest = await axiosInstance({
                url: `${baseURLTenantTwo}`,
                timeout: 20000,
                token: tenantTwoToken,
            }).post(`/IntegrationPackages?Overwrite=${overWrite}`, 
                JSON.stringify({"PackageContent":  Buffer.from(response.data, 'binary').toString("base64")}) 
            )

            console.log("Request successful:", postRequest.data);
        } catch(error) {
            if (error.response) {
                // how to handle overWrite=false -> if it is needed
                console.error("Server responded with error status:", error.response.status);
                console.error("Response data:", error.response.data);
                return res.status(error.response.status).json(error.response.data)
              
            } else if (error.request) {
                console.error("No response received from the server");
            } else {
                console.error("Error setting up the request:", error.message);
            }
        }
    }
        return res.status(200).json({message: "Request posted"})
}

// make this later on
async function downloadIntegrationPackage (req,res, integrationPackageId) {
    try {
        tenantOneToken = await getOAuthTenantOne();
        // get package by id and download package by id -> response-> if package by id not found
        // these both apis have the same response
        let response = await axiosInstance({
            url: `${baseURLTenantOne}/IntegrationPackages('${integrationPackageId}')/$value`,
            timeout: 50000,
            token: tenantOneToken,
            responseType: 'buffer'
        }).get();

        if( !response) {
            return res.status(200).json({message: "rectify this"})
        }

        res.setHeader('Content-Disposition', 'attachment; filename="file.zip"');
        res.setHeader('Content-Type', 'application/octet-stream'); // Set the appropriate content type
      
        // Send the buffer as the response
        return res.status(200).end(response.data, 'binary');
        

    } catch(error) {
        if (error.response.status === 404) {
            return res.status(404).json({ error: "Given package not found"});
        }
    }
}

async function getPackagesWithArtifactsInfo (req, res ) {
    const  {tenantOneId, tenantTwoId } = req.params;
    
    const [tenantOneResponse, tenantTwoResponse] = await Promise.all([
        Tenant.findByPk(tenantOneId),
        Tenant.findByPk(tenantTwoId)
    ]);

    async function getBearerToken(tenantResponse) {
        const authCredentials = {
            tokenEndpoint: tenantResponse.tenant_host_token_api,
            clientId: tenantResponse.tenant_host_username,
            clientSecret: decryptData(
                tenantResponse.tenant_host_password,
                getEncryptionIV(tenantResponse.tenant_iv_salt)
            )
        };
        return getOAuth(authCredentials);
    }

    const [tenantOneBearerToken, tenantTwoBearerToken] = await Promise.all([
        getBearerToken(tenantOneResponse),
        getBearerToken(tenantTwoResponse)
    ]);

    if (!tenantOneBearerToken || !tenantTwoBearerToken) {
        return res.status(404).json({ error: `Error in getting Bearer token for one of the tenants`});
    }

    async function fetchIntegrationPackages(tenantResponse, bearerToken) {
        const targetUrl = `${tenantResponse.tenant_host_url}/api/v1`;
        return axiosInstance({
            url: `${targetUrl}/IntegrationPackages`,
            token: bearerToken
        }).get();
    }

    
    const [responseTenantOne, responseTenantTwo] = await Promise.all([
        fetchIntegrationPackages(tenantOneResponse, tenantOneBearerToken),
        fetchIntegrationPackages(tenantTwoResponse, tenantTwoBearerToken)
    ]);

    if (responseTenantOne.error || responseTenantTwo.error) {
        return res.status(500).json({ message: "Error in fetching package records for tenant(s)" });
    }

    const [integrationPackagesTenantOne, integrationPackagesTenantTwo] = await Promise.all([
        mapToIntegrationPackage(responseTenantOne.data.d.results),
        mapToIntegrationPackage(responseTenantTwo.data.d.results)
    ]);

    async function fetchArtifacts(tenantResponse, bearerToken, integrationPackages) {
        const targetUrl = `${tenantResponse.tenant_host_url}/api/v1`;
        const packageArray = [];
        for (let i = 0; i < integrationPackages.length; i++) {
            const artifact = await axiosInstance({
                url: `${targetUrl}/IntegrationPackages('${integrationPackages[i].Id}')/IntegrationDesigntimeArtifacts`,
                token: bearerToken,
            }).get();
            packageArray.push({
                packageId: integrationPackages[i].Id,
                packageName: integrationPackages[i].Name,
                Artifacts: mapToArtifacts(artifact.data.d.results)
            });
        }
        return packageArray;
    }

    const [tenantOnePackageArray, tenantTwoPackageArray] = await Promise.all([
        fetchArtifacts(tenantOneResponse, tenantOneBearerToken, integrationPackagesTenantOne),
        fetchArtifacts(tenantTwoResponse, tenantTwoBearerToken, integrationPackagesTenantTwo)
    ]);

    const mainResponseArray = [
        { key: tenantOneResponse.tenant_name, packages: tenantOnePackageArray },
        { key: tenantTwoResponse.tenant_name, packages: tenantTwoPackageArray }
    ];

    return res.status(200).json({ data: mainResponseArray });

}

//----------------------------------------------------------------------------------------------//
// Non exported functions:
function mapToIntegrationPackage(input) {

    const mapKeys = [
        'Id', ,'Name', 
    ];

    // Understanding this function is the key
    function mapKeysToObject(keys, source) {
        return keys.reduce((acc, key) => {
            acc[key] = source[key];
            return acc;
        }, {});
    }

    // Check if input is an array
    if (Array.isArray(input)) {
        return input.map(item => mapKeysToObject(mapKeys, item));
    }
    // Otherwise, assume input is an object
    return  mapKeysToObject(mapKeys, input);
}

function mapToArtifacts(input) {

    const mapKeys = [
        "Id",
        "PackageId",
        "Name",
    ]

    // Understanding this function is the key
    function mapKeysToObject(keys, source) {
        return keys.reduce((acc, key) => {
            acc[key] = source[key];
            return acc;
        }, {});
    }

    // Check if input is an array
    if (Array.isArray(input)) {
        return input.map(item => mapKeysToObject(mapKeys, item));
    }
    // Otherwise, assume input is an object
    return  mapKeysToObject(mapKeys, input);
}

function checkIfIntegrationPackagesAvailable (inputArray,referenceArray) {
    const missingElements = inputArray.filter(item => !referenceArray.includes(item));
    return missingElements;
}


//-------------------------------------------------------------------

module.exports = {
    getIntegrationPackagesList,
    postList,
    getIntegrationPackageById,
    downloadIntegrationPackage,
    getPackagesWithArtifactsInfo
}


