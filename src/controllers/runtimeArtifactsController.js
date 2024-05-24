const runtimeArtifacts = require("../services/runtimeArtifactsService")
const getRuntimeArtifactsWithDesigntimeArtifacts= async (req, res) => {

    try {
        runtimeArtifacts.getSourceTenantRuntimeWithTargetTenantDesigntimeArtifacts(req, res)
    } catch (error) {
        console.log('Error in controller function: getRuntimeArtifactsWithDesigntimeArtifacts ', error);
    }
}

module.exports = {
    getRuntimeArtifactsWithDesigntimeArtifacts
}

