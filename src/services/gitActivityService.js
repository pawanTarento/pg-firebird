const { getOAuthGit } = require("../util/auth")

async function copyPackagesToGitRepository(req,res) {
   let abc = await getOAuthGit()
   res.json({"message": abc});
}

async function downloadPackageFromGit(req,res) {

}

module.exports = {
    copyPackagesToGitRepository,
    downloadPackageFromGit
}