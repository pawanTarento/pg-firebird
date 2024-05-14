const gitActivityService = require("../services/gitActionService");

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
// To check the connection to git 
const checkGitConnectionProper = (req, res) => {
    const grId = req.params.grId;
    try {
        gitActivityService.checkGitConnection(req,res, grId);

    } catch(error) {
        console.log('Error in copyPackagesOnGitFromTenant: ', error);
    }
}

module.exports = {
    copyPackagesOnGitFromTenant,
    downloadPackagesFromGitForTenant,
    checkGitConnectionProper
}