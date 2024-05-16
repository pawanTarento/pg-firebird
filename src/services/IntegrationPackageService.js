const { axiosInstance } = require("./cpiClient");
const {getOAuthTenantOne,getOAuthTenantTwo, getOAuth} = require("../util/auth");
const {  encryptData, decryptData,getEncryptionIV } = require("../util/decode")
const axios = require("axios");
const Tenant = require("../models/tenant");
const { artifactTypes } = require("../constants/apiEndpoints");

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

async function fetchIntegrationPackages(axiosInstance) {
    const url = `/api/v1/IntegrationPackages`;
    const response = await axiosInstance.get(url);
    return response;
}

async function fetchArtifacts(axiosInstance, integrationPackages, artifactTypes) {
    const fetchArtifact = async (integrationPackage, artifactType) => {
        const url = `/api/v1/IntegrationPackages('${integrationPackage.Id}')/${artifactType}`;
        const response = await axiosInstance.get(url);
        return response.data.d.results.map(artifact => ({
            Id: artifact.Id,
            Name: artifact.Name,
            Type: artifactType,
            Version: artifact.Version
        }));
    };

    const packageArray = await Promise.all(integrationPackages.map(async (integrationPackage) => {
        const artifactResponses = await Promise.all(artifactTypes.map(async (artifactType) => {
            return fetchArtifact(integrationPackage, artifactType);
        }));
        
        const artifacts = artifactResponses.flat();
        return {
            packageId: integrationPackage.Id,
            packageName: integrationPackage.Name,
            verison: integrationPackage.Version,
            artifacts
        };
    }));
    return packageArray;
}

async function getPackagesWithArtifactsInfo (req, res ) {
    const  {tenantOneId, tenantTwoId } = req.params;
    
    const [tenantOneDbResponse, tenantTwoDbResponse] = await Promise.all([
        Tenant.findByPk(tenantOneId),
        Tenant.findByPk(tenantTwoId)
    ]);

    const [tenantOneBearerToken, tenantTwoBearerToken] = await Promise.all([
        getBearerToken(tenantOneDbResponse),
        getBearerToken(tenantTwoDbResponse)
    ]);

    if (!tenantOneBearerToken || !tenantTwoBearerToken) {
        return res.status(404).json({ error: `Error in getting Bearer token for one of the tenants`});
    }
    
    const axiosInstanceTenantOne = axiosInstance({
        url: tenantOneDbResponse.tenant_host_url,
        token: tenantOneBearerToken
    });
    const axiosInstanceTenantTwo = axiosInstance({
        url: tenantTwoDbResponse.tenant_host_url,
        token: tenantTwoBearerToken
    });
    
    const [responseTenantOne, responseTenantTwo] = await Promise.all([
        fetchIntegrationPackages(axiosInstanceTenantOne),
        fetchIntegrationPackages(axiosInstanceTenantTwo)
    ]);

    if (responseTenantOne.error || responseTenantTwo.error) {
        return res.status(500).json({ message: "Error in fetching package records for tenant(s)" });
    }

    const [tenantOnePackageArray, tenantTwoPackageArray] = await Promise.all([
        fetchArtifacts(axiosInstanceTenantOne, responseTenantOne.data.d.results, artifactTypes),
        fetchArtifacts(axiosInstanceTenantTwo, responseTenantTwo.data.d.results, artifactTypes)
    ]);

    const mainResponseArray = [
        { key: tenantOneDbResponse.tenant_name, packages: tenantOnePackageArray },
        { key: tenantTwoDbResponse.tenant_name, packages: tenantTwoPackageArray }
    ];

    return res.status(200).json({ data: mainResponseArray });

}

//************************************************************* */
async function copyPackagesWithArtifacts ( req, res) {
    const  {tenantOneId, tenantTwoId } = req.params;
    // const { payload } = req.body;
    console.log('{tenantOneId, tenantTwoId }: ', tenantOneId, tenantTwoId );

    function validatePayload( payload ) {

    }
  
    let payload =  [
        {
            PackageId: "Hello",
            Artifacts: [ {
               Id: "Artifact-one",
               Version: "1.0.0",
               Type: "MessageMapping"
             }, 
             {
                Id: "Artifact-two",
                Version: "1.0.0",
                Type: "IntegrationFlow"
              }
            ]
        },
        {
            PackageId: "World",
            ArtifactIds: [ "Artifact-Four", "Artifact-Five", "Artifact-Six"]
        },
        {
            PackageId: "However"
            // No Artifact provided means, Copy everything from the package
        },
    ];
        const [tenantOneDbResponse, tenantTwoDbResponse] = await Promise.all([
        Tenant.findByPk(tenantOneId),
        Tenant.findByPk(tenantTwoId)
    ]);

    const [tenantOneBearerToken, tenantTwoBearerToken] = await Promise.all([
        getBearerToken(tenantOneDbResponse),
        getBearerToken(tenantTwoDbResponse)
    ]);

    if (!tenantOneBearerToken || !tenantTwoBearerToken) {
        return res.status(404).json({ error: `Error in getting Bearer token for one of the tenants`});
    }


    return res.status(200).send(tenantOneBearerToken)


    
    // const axiosInstanceTenantOne = axiosInstance({
    //     url: tenantOneDbResponse.tenant_host_url,
    //     token: tenantOneBearerToken
    // });
    // const axiosInstanceTenantTwo = axiosInstance({
    //     url: tenantTwoDbResponse.tenant_host_url,
    //     token: tenantTwoBearerToken
    // });

}

//----------------------------------------------------------------------------------------------//
// Non exported functions:
function mapToIntegrationPackage(input) {

    const mapKeys = [
        'Id', 'Name', "Version"
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

    // Id: 'Proxy_Sync_Generic_Outbound_Pattern',
    // Version: '1.0.8',
    // PackageId: 
    // Name:
    // Description: 
    // Sender: 
    // Receiver: 
    // CreatedBy:
    // CreatedAt: 
    // ModifiedBy:
    // ModifiedAt: 

    const mapKeys = [
        "Id",
        "PackageId",
        "Name",
        "Version"
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
    getPackagesWithArtifactsInfo,
    copyPackagesWithArtifacts
}


