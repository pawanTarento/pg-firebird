const UFMSyncDetail = require("../models/UFM/ufmSyncDetail");
const UFMSyncHeader = require("../models/UFM/ufmSyncHeader");
const UFMProfile = require("../models/ufmProfile");
const { getBearerTokenForTenants, getBearerTokenForIFlow } = require("../util/auth");
const { axiosInstance } = require("./cpiClient");
const  sequelize  = require("../dbconfig/config");

const getUserCredentials = async (req, res) => {
    try {
        const { ufmProfileId, componentTypeId } = req.params;
        console.log(`ufmProfileId: ${ufmProfileId}, componentTypeId: ${componentTypeId}`);

        const ufmProfileResponse = await UFMProfile.findOne( {
            where: {
                ufm_profile_id: ufmProfileId
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
    
        let [userCredentialsTenantOneResponse, userCredentialsTenantTwoResponse ] = await Promise.all([
            await axiosInstanceTenantOne.get("/api/v1/UserCredentials"),
            await axiosInstanceTenantTwo.get("/api/v1/UserCredentials")
        ])

    //    const mainResponseArray = {
    //         tenantOneUserCredentials: mapToUserCredentials( userCredentialsTenantOneResponse.data.d.results ), 
    //         tenantTwoUserCredentials: mapToUserCredentials( userCredentialsTenantTwoResponse.data.d.results )
    //    }

       const mainResponseArray = {
        tenantOneUserCredentials:  userCredentialsTenantOneResponse.data.d.results, 
        tenantTwoUserCredentials:  userCredentialsTenantTwoResponse.data.d.results
    }
        return res.status(200).json( { data: mainResponseArray })
    } catch(error) {
        console.log('Error in service fn getUserCredentials: ', error);
    }
}

const copyUserCredentialsInfo = async (req, res) => {

    const transaction = await sequelize.transaction();
    try {
    const { ufm_profile_id, component_type_id, user_id, payload } = req.body;

    
    console.log(`ufm_profile_id: ${ufm_profile_id}, component_type_id: ${component_type_id}`);

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
    
    const tenantOneUtilBearerToken = await getBearerTokenForIFlow (tenantOneDbResponse) ;


    const axiosInstanceUtilTenantOne = axiosInstance({
        url: tenantOneDbResponse.tenant_util_host_url,
        headers: {
            'CredentialType': 'UserCredential',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        token: tenantOneUtilBearerToken
    })

    const axiosInstanceTenantTwo = axiosInstance({
        url: tenantTwoDbResponse.tenant_host_url,
        token: tenantTwoBearerToken
    });

    let targetCredentialUrl = `/http/GetCredentials`;
    let utilResponse = await axiosInstanceUtilTenantOne.post(targetCredentialUrl,payload)
    if ( utilResponse) {
        console.log('Got util response');
    }

    let validCredentialPayload = [];
    let invalidCredentials = [];
    let validNames = []
    let inputData = utilResponse.data
    for ( let i = 0; i < inputData.length; i++) {
        if ( inputData[i].SecurityArtifactDescriptor.Status === "NOT_FOUND" ||
            inputData[i].Password === null
        ) {
            console.log('Status: ',inputData[i].SecurityArtifactDescriptor.Status,  'password:', inputData[i].Password );
            invalidCredentials.push(inputData[i].Name)
        } else {
            validNames.push (inputData[i].Name)
            validCredentialPayload.push( inputData[i])
        }
    }

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

    const createOrUpdateUserCredentials = async (credential) => {
        try {
        const targetUrl = credential.doesExistOnTarget 
            ? `/api/v1/UserCredentials('${credential.Name}')`
            : '/api/v1/UserCredentials';
        const requestMethod = credential.doesExistOnTarget ? 'put' : 'post';

        const foundElement = validCredentialPayload.find(element => element['Name'] === credential.Name);

        let response;

            if ( credential.doesExistOnTarget) {
                response = await axiosInstanceTenantTwo.put(encodeURI(targetUrl), {
                    "Name": credential.Name,
                    "Kind": credential.Kind,
                    "Description": credential.Description,
                    "User": credential.User,
                    "Password": foundElement.Password,
                    "CompanyId": credential.CompanyId
                })
            } else {
                delete credential.doesExistOnTarget;
    
                response = await axiosInstanceTenantTwo.post(targetUrl, {
                    ...credential, "Password": foundElement.Password
                 })
            }
       
            if (response) {
                console.log(`${requestMethod.toUpperCase()} response done for:`, credential.Name);
                await UFMSyncDetail.create({
                    ufm_sync_header_id: newUFMSyncHeader.ufm_sync_header_id,
                    ufm_sync_uc_name: credential.Name,
                    ufm_sync_uc_kind: credential.Kind,
                    ufm_sync_uc_description: credential.Description,
                    ufm_sync_uc_user: credential.User,
                    ufm_sync_uc_password: foundElement.Password,
                    ufm_sync_uc_company_id: credential.CompanyId,
                }, { transaction });
            }
        } catch(error) {
            invalidCredentials.push(credential.Name)
        }
    };

    const promises = validCredentialPayload.map(createOrUpdateUserCredentials);
    await Promise.all(promises);
    
    await transaction.commit();

    if (invalidCredentials.length) {
        return res.status(409).json({ invalidCredentials })
    }

    return res.status(200).json({ message: "User credentials copied successfully"})
    
  } catch(err){
        await transaction.rollback();
        console.log('Error in service post user credential: ');
        return res.status(500).json({ error: `Internal Server Error: ${err.message}`})
    }

}   

//----------------------------------------------------------------------------------------------//
// Non exported functions:
function mapToUserCredentials(input) {

    const mapKeys = [
        "Name",
        "Kind",
        "Description",
        "User",
        "Password",
        "CompanyId"
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

module.exports = {
    getUserCredentials,
    copyUserCredentialsInfo
}