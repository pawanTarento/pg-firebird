const integrationPackageService = require("../services/IntegrationPackageService");

async function getAllPackagesList(req, res) {
    try {
        integrationPackageService.getIntegrationPackagesList(req, res)
    }catch(error) {
        console.log("\nError in function: getAllPackagesList");
    }
}


async function postEntry(req, res) {

    const {packageIds, overWrite} = req.body;

    if(!packageIds) {
        return res.status(400).json({ error: "Packages Id(s) must be provided"});
    }

    if(!packageIds.length) {
        return res.status(400).json({ error: "Packages Id(s) must be provided"});
    }

    if(!overWrite) {
        return res.status(400).json({ error: "Overwrite parameter must be provided"})
    }

    try {
        await integrationPackageService.postList(req, res, packageIds, overWrite);
    } catch(error) {
        console.log('error: stack', error.stack)
        console.log("\nError in function: postEntry");

    }
}

async function getIntegrationPackageDetailsByPackageId (req,res) {
    console.log("\ngetIntegrationPackageDetailsByPackageId");
    // payload validation
    const  packageId  = req.params.id;
    console.log('Package Id: ', packageId);

    if (!packageId) {
        return res.status(400).json({ error: "package Id required"})
    }

    try {
        await integrationPackageService.getIntegrationPackageById(req, res, packageId);
    } catch(error) {
        console.log('Error message: ', error.message);
        console.log('error: stack', error.stack);
        console.log("\nError in function: getPackageById");

    }
}

async function downloadIntegrationPackageBlob (req,res) {
    console.log("\ngetIntegrationPackageDetailsByPackageId");
    // payload validation
    const  packageId  = req.params.packageId;
    console.log('Package Id: ', packageId);

    if (!packageId) {
        return res.status(400).json({ error: "package Id required"})
    }

    try {
        await integrationPackageService.downloadIntegrationPackage(req, res, packageId);
    } catch(error) {
        console.log('Error message: ', error.message);
        console.log('error: stack', error.stack);
        console.log("\nError in function: getPackageById");

    }

}

async function getAllPackagesWithArtifactsInformation(req, res) {
    try {
        await integrationPackageService.getPackagesWithArtifactsInfo(req, res);
    } catch(error) {
        console.log('Error message: ', error.message);
        console.log('error: stack', error.stack);
        console.log("\nError in function: getAllPackagesWithArtifactsInformation");

    }
}

// export all the modules
module.exports = {
    getAllPackagesList,
    postEntry,
    getAllPackagesWithArtifactsInformation,
    getIntegrationPackageDetailsByPackageId,
    downloadIntegrationPackageBlob
}