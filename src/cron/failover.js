const UFMFailoverProcess = require("../models/UFM/ufmFailoverProcess");
const UFMProfile = require("../models/ufmProfile");
const { Op } = require('sequelize');
const  sequelize  = require("../dbconfig/config");
const unzipper = require('unzipper');
const { Writable } = require('stream');
const { FAILOVER_ENTRY_TYPE, 
    SWITCH_BACK_ENTRY_TYPE, 
    FAILOVER_PROCESS_STATUS } = require("../constants/taxonomyValues");
const { getBearerTokenForTenants, getBearerTokenForIFlow } = require("../util/auth");
const { axiosInstance } = require("../services/cpiClient");
const UFMFailoverProcessComponent = require("../models/UFM/ufmFailoverProcessComponent");


const processFailoverJob = async () => {
    console.log('\nRunning this function in process failover job: ', new Date());

    try {

    while(true) {
       
        // const transaction = await sequelize.transaction();
        // check if any of the failover/switchback is in RUNNING: skip the entire block
        const FOSB_running_query = await UFMFailoverProcess.findOne({
            where: {
                entry_type_id: {
                    [Op.or]: [
                        FAILOVER_ENTRY_TYPE,
                        SWITCH_BACK_ENTRY_TYPE
                      ]
                }, 
                is_process_initiated_progress_id: FAILOVER_PROCESS_STATUS.RUNNING,
                is_last_record: true
            },
            order: [
                ['created_on', 'ASC'] // FIFO type
            ],
        })

            if (FOSB_running_query) {
                console.log('\nA task is already running')
                break;
            }


        // check if any of the failover/switchback is in scheduled
        const FOSB_query = await UFMFailoverProcess.findOne({
            where: {
                entry_type_id: {
                    [Op.or]: [
                        FAILOVER_ENTRY_TYPE,
                        SWITCH_BACK_ENTRY_TYPE
                      ]
                }, 
                is_process_initiated_progress_id: FAILOVER_PROCESS_STATUS.SCHEDULED,
                is_last_record: true
            },
            order: [
                ['created_on', 'ASC'] // FIFO type
            ],
            // transaction
        })
        


        if (FOSB_query) {
              // update the scheduled failover/switchback to running
            console.log('\n xyz: ', FAILOVER_PROCESS_STATUS.RUNNING, FOSB_query.failover_process_id )

            const updateFailoverProcessTable = await UFMFailoverProcess.update(
                {
                    is_process_initiated_progress_id: FAILOVER_PROCESS_STATUS.RUNNING
                },
                {
                    where: {
                        failover_process_id: FOSB_query.failover_process_id
                    },
                    // transaction
                }
            );

            // await transaction.commit();

            const commonInputData = await getCommonInformationForActivity(FOSB_query);
  
            switch(FOSB_query.entry_type_id) {

                // thing to consider here will be primary and secondary tenant

                case FAILOVER_ENTRY_TYPE: 
                                        console.log('\nPerforming failover'); 
                                        await performFailoverActivity(commonInputData);
                                        break;

                case SWITCH_BACK_ENTRY_TYPE: 
                                        console.log('\nPerforming switchback'); 
                                        await performSwitchbackActivity(commonInputData);
                                        break;

                default: console.log('\nFailover default');
            }
            
        } else {
            console.log('\nNothing to process for node-cron');
        }

            break; // for ensuring the while true -> breaks 
        } // single run while loop ends here



    } catch(error) {
        // await transaction.rollback();
        console.log('\nError in processFailover job function ', error);
    }

}

const getCommonInformationForActivity = async (FOSB_query) => {
    let commonInputData = {};
    try{
        const ufmProfileResponse = await UFMProfile.findOne( {
            where: {
                ufm_profile_id: FOSB_query.ufm_profile_id
            },
        })
    
        if (!ufmProfileResponse) {
            throw Error(`Ufm profile id: ${FOSB_query.ufm_profile_id} not found`)
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

       const axiosInstanceTenantOneGlobalVariable = axiosInstance({
        url: tenantOneDbResponse.tenant_host_url,
        responseType: 'stream',
        token: tenantOneBearerToken
       })

       const axiosInstanceTenantTwo = axiosInstance({
           url: tenantTwoDbResponse.tenant_host_url,
           token: tenantTwoBearerToken
       });

       const tenantTwoUtilBearerToken = await getBearerTokenForIFlow (tenantTwoDbResponse) ;
       
       const axiosInstanceUtilTenantTwo = axiosInstance({
        url: tenantTwoDbResponse.tenant_util_host_url,
        token: tenantTwoUtilBearerToken
       })

        
        if (FOSB_query.entry_type_id === FAILOVER_ENTRY_TYPE) {
            commonInputData = {
                primaryTenantId: ufmProfileResponse.ufm_profile_primary_tenant_id,
                secondaryTenantId: ufmProfileResponse.ufm_profile_secondary_tenant_id,
                activity_type: FAILOVER_ENTRY_TYPE,
                axiosInstancePrimaryTenant: axiosInstanceTenantOne,
                axiosInstancePrimaryTenantGlobalVariable: axiosInstanceTenantOneGlobalVariable,
                axiosInstanceSecondaryTenant: axiosInstanceTenantTwo,
                axiosInstanceUtilSecondaryTenant: axiosInstanceUtilTenantTwo,
                failoverProcessId: FOSB_query.failover_process_id
            }
        } 
    
        // reverse the primary and secondary for switch back activity
        if (FOSB_query.entry_type_id === SWITCH_BACK_ENTRY_TYPE) {
            commonInputData = {
                primaryTenantId: ufmProfileResponse.ufm_profile_secondary_tenant_id,
                secondaryTenantId: ufmProfileResponse.ufm_profile_primary_tenant_id,
                activity_type: SWITCH_BACK_ENTRY_TYPE,
                axiosInstancePrimaryTenant: axiosInstanceTenantTwo,
                axiosInstanceSecondaryTenant: axiosInstanceTenantOne,
                failoverProcessId: FOSB_query.failover_process_id
            }
        }
    
        return commonInputData;
    } catch(error) {
        console.log('\nError in getting common information', error);
        return error.message;
    }

  
}


const performFailoverActivity = async (commonInputData) => {
    // const isHeartBeatActivityPerformed = await heartBeatServiceProcedure(commonInputData);

    // if (isHeartBeatActivityPerformed) {
    //     console.log('\nHeart beat activity performed');
    // }

    // const isUndeployed = await undeployArtifacts(commonInputData);

    // if (isUndeployed) {
    //     console.log('\nUndeployed runtime artifacts from primary site');
    // }

    // const isCopiedGV = await copyGlobalVariables(commonInputData);

    // if (isCopiedGV) {
    //     console.log('\n copied global variables')
    // }

    




    
    // then deploy undeploy artifacts
    // deployUndeployArtifacts(FOSB_query);

}

// this function collects all the required info/resources at one places -> to make the code modular

const performSwitchbackActivity = async (commonInputData) => {

}

const heartBeatServiceProcedure = async (commonInputData) => {
    let isHeartBeatActivityPerformed = true;

    let activity_type = '';
    console.log('\n... I am doing heartbeat ...');
    try {
        if (commonInputData.activity_type === FAILOVER_ENTRY_TYPE) {
            activity_type = 'Failover';
            try {
                const healthProbleUrl = `/api/v1/IntegrationRuntimeArtifacts('ping_healthprobe')`;
                let responseHealthProbe = await commonInputData.axiosInstanceSecondaryTenant.get(healthProbleUrl);
    
                if (responseHealthProbe) {
                    isHeartBeatActivityPerformed = true;
                    console.log('\nFailover: Heart beat is there\n');
                } 
            } catch(error) {
                // if error set the health probe to deployed state in secondary
                const deployHealthProbeUrl = `/api/v1/DeployIntegrationDesigntimeArtifact?Id='ping_healthprobe'&Version='1.0.10'`; // remove hardcoding
                let deployHealthProbe = await commonInputData.axiosInstanceSecondaryTenant.post(deployHealthProbeUrl);

                if (deployHealthProbe) {
                    console.log('\nFailover: health probe deployed');
                }
            }

            // undeploy from primary tenant
            const undeployHealthProbeUrl = `/api/v1/IntegrationRuntimeArtifacts('ping_healthprobe')`
            let undeployHealthProbe = await commonInputData.axiosInstancePrimaryTenant.delete(undeployHealthProbeUrl);

            if (undeployHealthProbe) {
                console.log('\nUndeployed from primary\n');
            }

        }
    
        if (commonInputData.activity_type === SWITCH_BACK_ENTRY_TYPE) {
            activity_type = 'Switchback';
            /*
            try {
                const healthProbleUrl = `/api/v1/IntegrationRuntimeArtifacts('ping_healthprobe')`;
                let responseHealthProbe = await commonInputData.axiosInstanceSecondaryTenant.get(healthProbleUrl);
    
                if (responseHealthProbe) {
                    isHeartBeatActivityPerformed = true;
                    console.log('\nFailover: Heart beat is there\n');
                } 
            } catch(error) {
                // if error set the health probe to deployed state in secondary
                const deployHealthProbeUrl = `/api/v1/DeployIntegrationDesigntimeArtifact?Id='ping_healthprobe'&Version='1.0.10'`; // remove hardcoding
                let deployHealthProbe = await commonInputData.axiosInstanceSecondaryTenant.post(deployHealthProbeUrl);

                if (deployHealthProbe) {
                    console.log('\nFailover: health probe deployed');
                }
            }

            // undeploy from primary tenant
            const undeployHealthProbeUrl = `/api/v1/IntegrationRuntimeArtifacts('ping_healthprobe')`
            let undeployHealthProbe = await commonInputData.axiosInstancePrimaryTenant.delete(undeployHealthProbeUrl);

            if (undeployHealthProbe) {
                console.log('\nUndeployed from primary\n');
            }
            */
    
        }
    } catch(error) {
        isHeartBeatActivityPerformed = false;
        console.log(`\nError in heart beat service procedure for ${activity_type}: `, error);
        return isHeartBeatActivityPerformed;
    }

    return isHeartBeatActivityPerformed;

}

const numberRangeAndGlobalVariablesCopy = () => {
    const isSuccessfulOperation = false;
    const is_NR_copied = copyNumberRanges(commonInputData);
    const is_GR_copied = copyGlobalVariables(commonInputData);
    
    if (is_NR_copied && is_GR_copied) {
        isSuccessfulOperation = true
    }

    return isSuccessfulOperation;
}

const copyNumberRanges = () => {

    return true;
}

const copyGlobalVariables = async (commonInputData) => {
    if (commonInputData.activity_type === FAILOVER_ENTRY_TYPE) {

        let variablesTenantOneResponse = await commonInputData.axiosInstancePrimaryTenant.get("/api/v1/Variables");
        let variablesTenantOne = variablesTenantOneResponse.data.d.results;

        const copiedVariables = [];
        const notCopiedVariables = [];

        async function copyVariables(variableObj) {
            try {
              const url = `/api/v1/Variables(VariableName='${variableObj.VariableName}',IntegrationFlow='${variableObj.IntegrationFlow}')/$value`;
          
              const response = await commonInputData.axiosInstancePrimaryTenantGlobalVariable.get(url);
              if (!response.data) {
                throw new Error('No data received for variable');
              }
          
    // This portion sets up a writable stream to capture the content of the file inside the zip archive.
              let fileContent = '';
              const writableStream = new Writable({
                write(chunk, encoding, callback) {
                  fileContent += chunk.toString();
                  callback();
                }
              });
    
     //This portion sets up a writable stream to capture the content of the file inside the zip archive.     
              await new Promise((resolve, reject) => {
                response.data
                  .pipe(unzipper.ParseOne('headers.prop'))
                  .pipe(writableStream)
                  .on('finish', resolve)
                  .on('error', reject);
              });
              
    //This portion parses the accumulated content of the extracted file (fileContent) into a key-value object.
              const variables = fileContent.split('\n').reduce((acc, line) => {
                const [key, value] = line.split('=');
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
              }, {});
          
              // if variable value is undefined, assign it an empty string
              const variableValue = variables[variableObj.VariableName] || '';
    
              // prepare data for post call using util to Tenant two
              const inputData = {
                data: [
                  {
                    VariableName: variableObj.VariableName,
                    VariableValue: variableValue
                  }
                ]
              };
          
              // make a post call to our util endpoint on tenant two to post the variable
              const setVariable = await commonInputData.axiosInstanceUtilSecondaryTenant.post('http/Util/SetVariable', inputData);
          
              if (setVariable) {
                console.log('Variable set in tenant two using iflow for', variableObj.VariableName);
                copiedVariables.push(`${variableObj.VariableName}`); // push data into success array
              } else {
                console.log('Variable NOT set in tenant two using iflow for', variableObj.VariableName);
              }
            } catch (error) {
              console.error('Error processing variable:', variableObj.VariableName, error.message);
              notCopiedVariables.push( variableObj.VariableName);
            }
          }

          const promises = variablesTenantOne.map(copyVariables);
          await Promise.all(promises);
          return true;
    }


    if (commonInputData.activity_type === SWITCH_BACK_ENTRY_TYPE) {

        return true;
    }

    return true;
}

const undeployArtifacts = async (commonInputData) => {

// create a batch for undeployment of runtime artifacts
if (commonInputData.activity_type === FAILOVER_ENTRY_TYPE) {
    const failoverProcessComponent = await UFMFailoverProcessComponent.findAll({
        where:{
            failover_process_id: commonInputData.failoverProcessId
        },
        order: [['failover_process_component_id', 'DESC']],
        // limit: 30
    })

    if (!failoverProcessComponent) {
        console.log('\nFailover process component data not found for failover process id:', commonInputData.failover_process_id)
    }

    // update the fields for timestamps
    await UFMFailoverProcessComponent.update(
        {
            primary_tenant_runtime_started_on: null,
            primary_tenant_runtime_completed_on: null,
            primary_tenant_runtime_error: null

        },
        {
            where: {
                failover_process_id: commonInputData.failoverProcessId
            }
        }
    );

    let counterArtifacts = 0;
    const promisesForUndeploying = failoverProcessComponent.map(async (component) => {
        try {
            // In case an artifact is already undeployed, undeploying it would result in 404

            await UFMFailoverProcessComponent.update(
                {
                    primary_tenant_runtime_started_on:  Math.floor(Date.now() / 1000)
                },
                {
                    where: {
                        failover_process_component_id: component.failover_process_component_id
                    }
                }
            );

            counterArtifacts++;

            let undeployArtifactsUrl = `/api/v1/IntegrationRuntimeArtifacts('${component.config_component_id}')`;
            let undeployedArtifact = await commonInputData.axiosInstancePrimaryTenant.delete(undeployArtifactsUrl);

            if (undeployedArtifact) {
                console.log(`Artifact undeployed is: `, component.config_component_id);
                
                await UFMFailoverProcessComponent.update(
                    {
                        primary_tenant_runtime_completed_on:  Math.floor(Date.now() / 1000),
                        primary_tenant_runtime_status: "UNDEPLOYED"
                    },
                    {
                        where: {
                            failover_process_component_id: component.failover_process_component_id
                        }
                    }
                );
            }

        } catch (error) {
            let errorMessage = '';

            if (error.response && error.response.status === 404) {
                errorMessage = `Artifact id: ${component.config_component_id} is already undeployed (404 error) or not found.`;
                console.error(errorMessage);
            } else {
                console.error(`Error undeploying artifact with id ${component.config_component_id}:`);
                let errorString = JSON.stringify(error);
                errorMessage = errorString.substring(0, 1024);
            }

            await UFMFailoverProcessComponent.update(
                {
                    primary_tenant_runtime_error: errorMessage,
                    primary_tenant_runtime_status: "UNDEPLOYMENT_ERROR"
                },
                {
                    where: {
                        failover_process_component_id: component.failover_process_component_id
                    }
                }
            );
        }
    });

    // since there is no particular order of undeployment, we are using promise.all 
    await Promise.all(promisesForUndeploying);
    console.log('\nCounter artifacts: ', counterArtifacts)
    return true;

    
} // if part for failover ends here

if (commonInputData.activity_type === SWITCH_BACK_ENTRY_TYPE) {

}



}


module.exports =  {
    processFailoverJob
}