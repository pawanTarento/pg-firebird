const { axiosInstance } = require("./cpiClient");
const {getOAuthTenantOne,getOAuthTenantTwo, getBearerTokenForTenants, getOAuth} = require("../util/auth");
const {  encryptData, decryptData,getEncryptionIV } = require("../util/decode")
const axios = require("axios");
const Tenant = require("../models/tenant");
const { artifactTypes } = require("../constants/apiEndpoints");
const UFMProfile = require("../models/ufmProfile");
const UFMSyncHeader = require("../models/UFM/ufmSyncHeader");
const UFMSyncDetail = require("../models/UFM/ufmSyncDetail");
const  sequelize  = require("../dbconfig/config");


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
    console.log('REACHINGHERE');
    const url = `/api/v1/IntegrationPackages`;
    console.log('URL package: ', url)
    const response = await axiosInstance.get(url);
    return response;
}

async function fetchArtifacts(axiosInstance, integrationPackages, artifactTypes) {
    const fetchArtifact = async (integrationPackage, artifactType) => {
        const url = `/api/v1/IntegrationPackages('${integrationPackage.Id}')/${artifactType}`;
        console.log('\nURL : ', url)
        const response = await axiosInstance.get(url);
        return response.data.d.results.map(artifact => ({
            Id: artifact.Id,
            Name: artifact.Name,
            Type: artifactType,
            Version: artifact.Version,
            doesConfigExists: artifact.hasOwnProperty('Configurations') ? true: false,
            // Configuration: artifact.Configurations
        }));
    };

    const packageArray = await Promise.all(integrationPackages.map(async (integrationPackage) => {
        const artifactResponses = await Promise.all(artifactTypes.map(async (artifactType) => {
            return fetchArtifact(integrationPackage, artifactType);
        }));
        
        const artifacts = artifactResponses.flat();
        return {
            PackageId: integrationPackage.Id,
            PackageName: integrationPackage.Name,
            Version: integrationPackage.Version,
            Description: integrationPackage.Description,
            ShortText: integrationPackage.ShortText,
            SupportedPlatform: integrationPackage.SupportedPlatform,
            Products: integrationPackage.Products,
            Keywords: integrationPackage.Keywords,
            Countries: integrationPackage.Countries,
            Industries: integrationPackage.Industries,
            LineOfBusiness: integrationPackage.LineOfBusiness,
            artifacts
        };
    }));
    return packageArray;
}

const getPackagesWithArtifacts= async (tenantOneId, tenantTwoId, isCalledFromAPI = false) => {
    try {
    const [tenantOneDbResponse, tenantTwoDbResponse] = await Promise.all([
        Tenant.findByPk(tenantOneId),
        Tenant.findByPk(tenantTwoId)
    ]);

    const [tenantOneBearerToken, tenantTwoBearerToken] = await Promise.all([
        getBearerToken(tenantOneDbResponse),
        getBearerToken(tenantTwoDbResponse)
    ]);

    if (!tenantOneBearerToken || !tenantTwoBearerToken) {
        throw Error(`Error in getting Bearer token for one of the tenants`)
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
        throw Error("Error in fetching package records for tenant(s)")
    }

    const [tenantOnePackageArray, tenantTwoPackageArray] = await Promise.all([
        fetchArtifacts(axiosInstanceTenantOne, responseTenantOne.data.d.results, artifactTypes),
        fetchArtifacts(axiosInstanceTenantTwo, responseTenantTwo.data.d.results, artifactTypes)
    ]);

    const mainResponseArray = [
        { key: tenantOneDbResponse.tenant_name, packages: tenantOnePackageArray },
        { key: tenantTwoDbResponse.tenant_name, packages: tenantTwoPackageArray }
    ];
    if (isCalledFromAPI) {
        return mainResponseArray;
    } else {
        return { mainResponseArray,axiosInstanceTenantOne, axiosInstanceTenantTwo }
    }
    } catch(error) {
        console.log('Error in service function getPackagesWithArtifacts: ', error.message);
        return error.message;
    }   

}
async function getPackagesWithArtifactsInfo (req, res ) {
    const  {tenantOneId, tenantTwoId } = req.params;
    let isCalledFromAPI = true;
    let mainResponseArray = await getPackagesWithArtifacts(tenantOneId, tenantTwoId, isCalledFromAPI);
    
   if (!Array.isArray(mainResponseArray)) {
    return res.status(500).json({ error: mainResponseArray})
   }
    return res.status(200).json({ data: mainResponseArray });

}

function bifurcatePayload( payload ) {
    let packagesToCloneArray = [];
    let packagesWithArtifacts = [];
    if (!Array.isArray(payload)) {
        return res.status(400).json({ message: "Expecting Package Artifact list in an array format"})
    } 

    if ( !payload.length) {
        return res.status(400).json({ message: "Payload is empty."})
    }

    for ( let i=0; i< payload.length; i++) {

        if ( payload[i].hasOwnProperty("artifacts") && payload[i].hasOwnProperty("packageId")) {
           
            packagesWithArtifacts.push( payload[i] );
        } else {
            packagesToCloneArray.push ( payload[i] );
        }

    }

    return [packagesToCloneArray, packagesWithArtifacts]
}

async function copyPackagesWithArtifacts(req, res) {
    // tenantOneId -> this is my source tenant
    // tenantTwoId -> this is my target tenant
    // const { tenantOneId, tenantTwoId } = req.params;
    const { ufm_profile_id } = req.body;
    const { component_type_id } = req.body;
    const { user_id } = req.body;
    const { payload } = req.body;

    const [onlyPackagesToClone, packagesWithArtifacts] = bifurcatePayload(payload);
    console.log('onlyPackagesToClone: ', onlyPackagesToClone);
    console.log('packagesWithArtifacts: ', JSON.stringify(packagesWithArtifacts, null, 2));
            // transaction will be available in the functions too
            const transaction = await sequelize.transaction();
    try {
        const ufmProfileResponse = await UFMProfile.findOne( {
            where: {
                ufm_profile_id: ufm_profile_id
            }
        })
        if (!ufmProfileResponse) {
            return res.status(400).json({ error: "UFM Profile id not found"})
        }

        const [
             tenantOneBearerToken, tenantTwoBearerToken,
             tenantOneDbResponse, tenantTwoDbResponse 
        ] = await getBearerTokenForTenants(
            ufmProfileResponse.ufm_profile_primary_tenant_id, 
            ufmProfileResponse.ufm_profile_secondary_tenant_id);

        // return res.status(200).json({ message: "Hello, World!"})
        const axiosInstanceTenantOne = axiosInstance({
            url: tenantOneDbResponse.tenant_host_url,
            responseType: 'arraybuffer',
            token: tenantOneBearerToken
        });

        const axiosInstanceTenantTwo = axiosInstance({
            url: tenantTwoDbResponse.tenant_host_url,
            token: tenantTwoBearerToken
        });
       

     const updateResult =    await UFMSyncHeader.update(
            { is_last_record: false },
            { where: 
                { 
                ufm_profile_id: ufm_profile_id,
                ufm_component_type_id: component_type_id,
                is_last_record: true 
            }
            , transaction 
        }
          );

          const newUFMSyncHeader = await UFMSyncHeader.create({
            ufm_profile_id: ufm_profile_id,
            ufm_component_type_id: component_type_id,
            is_last_record: true,
            created_by: user_id, // this is from FE
            modified_by: user_id, // this is from FE
          }, 
          { transaction }
        
        );

        // Function to create packages with Artifacts
        const createPackageWithArtifacts = async (packageData, instanceOne, instanceTwo) => {
            try {
                const { packageId, isExistingOnTarget, artifacts } = packageData;
                if (!isExistingOnTarget) {

                    let packageObject = {
                        "Id": packageId,
                        "Name": packageData.Name,
                        "Version": packageData.Version,
                        "Description": packageData.Description,
                        "ShortText": packageData.ShortText,
                        "SupportedPlatform": packageData.SupportedPlatform,
                        "Products": packageData.Products,
                        "Keywords": packageData.Keywords,
                        "Countries": packageData.Countries,
                        "Industries": packageData.Industries,
                        "LineOfBusiness": packageData.LineOfBusiness
                    }
                    console.log('packageObject: ', packageObject)
                    try {
                        const postRequest = await instanceTwo.post(`/api/v1/IntegrationPackages`, 
                        JSON.stringify(packageObject)
                      );
                      console.log("Package creation successful: ", postRequest.data);

                    } catch(error) {
                        console.log('package error: ', error)
                    }
               
                }

                await Promise.all(artifacts.map(async (artifact) => {

                    const artifactEndpointString = getArtifactEndpointString(artifact.Type);
                    const getUrl = `/api/v1/${artifactEndpointString}(Id='${artifact.Id}',Version='${artifact.Version}')/$value`;
                    const getRequest = await instanceOne.get(getUrl);
                    // console.log('THIS: ', Buffer.from(getRequest.data, 'binary').toString("base64"));
                    const postRequest = await instanceTwo.post(
                        `/api/v1/${artifactEndpointString}`,
                        JSON.stringify({
                            Id: artifact.Id,
                            Name: artifact.Name,
                            PackageId: packageId,
                            ArtifactContent: Buffer.from(getRequest.data, 'binary').toString("base64")
                        })
                    );

                    

                    await UFMSyncDetail.create( {
                        ufm_sync_header_id: newUFMSyncHeader.ufm_sync_header_id,
                        ufm_sync_component_package_id: packageId,
                        ufm_sync_component_package_name: packageData.Name,
                        ufm_sync_component_package_desc: packageData.Description,
                        ufm_sync_component_package_shorttext: packageData.ShortText,
                        ufm_sync_component_package_version: packageData.Version,
                        ufm_sync_component_id:artifact.Id ,
                        ufm_sync_component_name: artifact.Name,
                        ufm_sync_component_desc: "description",
                        ufm_sync_component_version: artifact.Version,
                        },
                        { transaction }
                    )
                        
                    console.log("Artifact copy successful: ", artifact.Id);
                }));
            } catch (error) {
                console.error('Error processing artifact of package: ', packageData.packageId, error);
                throw Error('Copying of artifact unsuccessful', packageData.packageId, error)
            }
        };

        const createOrCopySinglePackage = async (packageData, instanceOne, instanceTwo) => {
            console.log('createOrCopySinglePackage', packageData.packageId );
            try {
                let url = `/api/v1/IntegrationPackages('${packageData.packageId}')/$value`;
                let response = await instanceOne.get(url);
                
                if (!response.data) {
                    throw new Error(`No data received for package ${packageData.packageId}`);
                }
        
                // Convert the binary data to base64 string
                let packageContentBase64 = Buffer.from(response.data, 'binary').toString("base64");
        
                // Post the package content to tenant two
                let postRequest = await instanceTwo.post(
                    `/api/v1/IntegrationPackages?Overwrite=true`,
                    JSON.stringify({
                        "PackageContent": packageContentBase64
                    })
                );
        
                if (postRequest) {
                    console.log("Package creation successful:", postRequest.data);
                }
            } catch (error) {
                console.error('Error creating empty package:', packageData.packageId, error.message);
            }
        };
        

        // Create or copy packages concurrently
        try {
            await Promise.all([
                ...onlyPackagesToClone.map(packageData => createOrCopySinglePackage(packageData, axiosInstanceTenantOne, axiosInstanceTenantTwo)),
                ...packagesWithArtifacts.map(packageData => createPackageWithArtifacts(packageData, axiosInstanceTenantOne, axiosInstanceTenantTwo))
            ]);
            await transaction.commit();
            return res.status(200).json({ message: "Packages and Artifacts copied successfully" });
        } catch(error) {
            await transaction.rollback();
            console.log('Error: in promise all : ', error);
        }

      
    } catch (error) {
        // await transaction.rollback();
        console.error('Error in copyPackagesWithArtifacts: ', error.message);
        return res.status(500).json({ error: 'Error in copyPackagesWithArtifacts',  });
    }
}

function getArtifactEndpointString(type) {
    switch (type) {
        case "IntegrationDesigntimeArtifacts":
            return "IntegrationDesigntimeArtifacts";
        case "MessageMappingDesigntimeArtifacts":
            return "MessageMappingDesigntimeArtifacts";
        case "ValueMappingDesigntimeArtifacts":
            return "ValueMappingDesigntimeArtifacts";
        case "ScriptCollectionDesigntimeArtifacts":
            return "ScriptCollectionDesigntimeArtifacts";
        default:
            throw new Error('Invalid artifact type');
    }
}

const copyConfigurations= async(req, res) => {
    const {ufm_profile_id, component_type_id, packages } = req.body;

    try {
        const ufmProfileResponse = await UFMProfile.findOne( {
            where: {
                ufm_profile_id: ufm_profile_id
            }
        })
        if (!ufmProfileResponse) {
            return res.status(400).json({ error: "UFM Profile id not found"})
        }

        const [
             tenantOneBearerToken, tenantTwoBearerToken,
             tenantOneDbResponse, tenantTwoDbResponse 
        ] = await getBearerTokenForTenants(
            ufmProfileResponse.ufm_profile_primary_tenant_id, 
            ufmProfileResponse.ufm_profile_secondary_tenant_id);

        const axiosInstanceTenantOne = axiosInstance({
            url: tenantOneDbResponse.tenant_host_url,
            token: tenantOneBearerToken
        });

        const axiosInstanceTenantTwo = axiosInstance({
            url: tenantTwoDbResponse.tenant_host_url,
            token: tenantTwoBearerToken
        });

        const ufmSyncHeaderResponse = await UFMSyncHeader.findOne({
            where: {
                ufm_profile_id: ufm_profile_id,
                ufm_component_type_id: component_type_id,
                is_last_record: true
            }
        });

        // if (!ufmSyncHeaderResponse) {
        //     return res.status(200).json({error: "Sync the same packages and artifacts first before synchronising Configurations for the same"});
        // }
        
        let failedConfigurations=[];
        // // Process each package and artifact in parallel
        const packagePromises = packages.map(pkg =>
            pkg.artifacts.map(async artifact => {
                const url = `/api/v1/IntegrationDesigntimeArtifacts(Id='${artifact.Id}',Version='${artifact.Version}')/Configurations`;
                const response = await axiosInstanceTenantOne.get(url);
                const configObjects = response.data.d.results;

                const configPromises = configObjects.map(async configObj => {
                const targetUrl = encodeURI( `/api/v1/IntegrationDesigntimeArtifacts(Id='${artifact.Id}',Version='${artifact.Version}')/$links/Configurations('${configObj.ParameterKey}')`);
                    try {
                     let updatedResponse =   await axiosInstanceTenantTwo.put(targetUrl,       
                      {
                            ParameterValue: configObj.ParameterValue,
                            DataType: configObj.DataType
                        });

                        if (updatedResponse) {
                            console.log('\n\n----------------------HAPPENED for: ', artifact.Id)
                            const updateSyncHeaderDetail = await UFMSyncDetail.update({
                                ufm_backup_component_config_moved: true,
                                ufm_backup_component_config_moved_timestamp: Math.floor(Date.now() / 1000)
                            }, {
                                where: {
                                    ufm_sync_header_id: ufmSyncHeaderResponse.ufm_sync_header_id,
                                    ufm_sync_component_package_id: pkg.PackageId,
                                    ufm_sync_component_package_version: pkg.Version,
                                    ufm_sync_component_id: artifact.Id,
                                    ufm_sync_component_version: artifact.Version
                                }
                            });
                        } 
                    } catch (error) {
                        console.error(`Failed to copy configuration for ${artifact.Id} - ${configObj.ParameterKey}:`);
                        failedConfigurations.push({
                            artifactId: artifact.Id,
                            parameterKey: configObj.ParameterKey,
                            parameterValue: configObj.ParameterValue,
                            dataType: configObj.DataType,
                            error: error.message,
                            errorMessage: `Failed to copy configuration for ${artifact.Id} - ${configObj.ParameterKey}:`
                        });
                    }
                });

                await Promise.all(configPromises);
            })
        );

        await Promise.all(packagePromises.flat());

 
        return res.status(200).json({ message: "Configurations copied successfully", failedConfigurations });
        // return res.status(200).json({ message: "Hello, World!", failedConfigurations})
    }  catch(error) {
        console.log('Error in service copyConfigurations: ', error);
        return res.status(500).json({ error: "Error in copying configurations"})
       }

}

//----------------------------------------------------------------------------------------------//
// Non exported functions:
function mapToIntegrationPackage(input) {

    const mapKeys = [
    "Id",
    "Name",
    "ResourceId",
    "Description",
    "ShortText",
    "Version",
    "Vendor",
    "PartnerContent",
    "UpdateAvailable",
    "Mode",
    "SupportedPlatform",
    "ModifiedBy",
    "CreationDate",
    "ModifiedDate",
    "CreatedBy",
    "Products",
    "Keywords",
    "Countries",
    "Industries",
    "LineOfBusiness"
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
    copyPackagesWithArtifacts,
    fetchArtifacts,
    fetchIntegrationPackages,
    getPackagesWithArtifacts,
    copyConfigurations
}


