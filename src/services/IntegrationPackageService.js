const { axiosInstance } = require("./cpiClient");
const {getOAuthTenantOne,getOAuthTenantTwo} = require("../util/auth");
const axios = require("axios");

const baseURLTenantOne = "https://86f3b06dtrial.it-cpitrial06.cfapps.us10-001.hana.ondemand.com/api/v1";
const baseURLTenantTwo = "https://ad58f2f9trial.it-cpitrial06.cfapps.us10-001.hana.ondemand.com/api/v1";

var tenantOneToken = '';
/****************************** GET All Packages for a tenant ********************************* */
async function getIntegrationPackagesList(req, res, isFunctionCall=false) {
    tenantOneToken = await getOAuthTenantOne(); // For which tenant it is being done? adjust this in code logic
    let response = await axiosInstance({
        url: `${baseURLTenantOne}/IntegrationPackages`,
        timeout:4000,
        token: tenantOneToken
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

//----------------------------------------------------------------------------------------------//
// Non exported functions:
function mapToIntegrationPackage(input) {

    const mapKeys = [
        'Id', 'ResourceId','Name', 'ShortText', 'Version', 'Mode','ModifiedBy', 'CreationDate', 'ModifiedDate', 'CreatedBy', 'Description', 
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

function checkIfIntegrationPackagesAvailable (inputArray,referenceArray) {
    const missingElements = inputArray.filter(item => !referenceArray.includes(item));
    return missingElements;
}

async function getIntegrationPackage (packageId, ) {

}



//-------------------------------------------------------------------

module.exports = {
    getIntegrationPackagesList,
    postList,
    getIntegrationPackageById,
    downloadIntegrationPackage
}


