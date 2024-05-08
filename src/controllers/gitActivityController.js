const gitActivityService = require("../services/gitActivityService");

async function copyPackagesOnGitFromTenant(req, res) {
    try {
        gitActivityService.copyPackagesToGitRepository(req,res);

    } catch(error) {
        console.log('Error in copyPackagesOnGitFromTenant: ', error);
    }
}

async function downloadPackagesFromGitForTenant(req, res) {
    console.log("\nPost request")
    return res.status(200).json({ message: "hello"})
}

module.exports = {
    copyPackagesOnGitFromTenant,
    downloadPackagesFromGitForTenant
}