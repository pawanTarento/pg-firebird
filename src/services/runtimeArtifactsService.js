const { getBearerTokenForTenants } = require('../util/auth');
const integrationPackageService = require('./IntegrationPackageService');
const { axiosInstance } = require("./cpiClient");
const {artifactTypes} = require("../constants/apiEndpoints")

const getSourceTenantRuntimeWithTargetTenantDesigntimeArtifacts = async (req, res) => {
    const {tenantOneId, tenantTwoId } = req.params;
    console.log('tenantOneId', tenantOneId);
    console.log('tenantTwoId', tenantTwoId);
    try {
      
        let artifactPackageResponse = await integrationPackageService.getPackagesWithArtifacts(tenantOneId, tenantTwoId, false);

        let tenantOneSourcePackagesWithArtifacts = artifactPackageResponse.mainResponseArray[0].packages; // using the packages for tenant 1

        let axiosInstanceTenantOne = artifactPackageResponse.axiosInstanceTenantOne ;
        let responseRuntime = await axiosInstanceTenantOne.get(`/api/v1/IntegrationRuntimeArtifacts`)
        let responseRuntimeResult = responseRuntime.data.d.results;
        // Create a map of runtime artifacts for quick lookup by Id
        let runtimeArtifactsMap = new Map(responseRuntimeResult.map(item => [item.Id, item.Version]));
        console.log('runtimeArtifactsMap: ', runtimeArtifactsMap);
        // Update artifact versions with runtime versions
        tenantOneSourcePackagesWithArtifacts.forEach( item => {

            item.artifacts.forEach( artifact => {
                if (artifact.Type === "IntegrationDesigntimeArtifacts") {
                    if (runtimeArtifactsMap.has(artifact.Id)) { 
                        artifact.RuntimeVersion = runtimeArtifactsMap.get(artifact.Id);
                    } else {
                        artifact.RuntimeVersion = "N/A";
                        // only for integration runtime artifacts I would be able to 
                    }
                }
            });

        });

        // Return the updated packages with artifacts
        return res.status(200).json({ data: [
            {
                // For Tenant 1, get Runtime artifacts alongwith Packages
                key: artifactPackageResponse.mainResponseArray[0].key,
                packages: tenantOneSourcePackagesWithArtifacts
            },
            {
                ...artifactPackageResponse.mainResponseArray[1] // For Tenant 2, get Designtime artifacts alongwith Packages
            }
        ] });
    } catch(error) {
        console.log('Service fn: getSourceTenantRuntimeWithTargetTenant error:', error);
    }

}

module.exports = {
    getSourceTenantRuntimeWithTargetTenantDesigntimeArtifacts
}