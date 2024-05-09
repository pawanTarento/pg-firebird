const userMasterColumns =[
    "Id", 
    "userId", 
    "externalId", 
    "email", 
    "role", 
    "isAdmin",
    "firstLogin", 
    "lastLogin", 
    "timeZone", 
    "createdAt", 
    "updatedAt" 
];

const gitMasterColumns = [
    "gr_id",
    "gr_name",
    "gr_description",
    "gr_environment_id",
    "gr_host_url",
    "gr_auth_method_id",
    "gr_api_token",
    "gr_client_secret",
    "gr_client_id",
    "gr_iv_salt",
    "gr_state_id",
    "created_by",
    "modified_by"
];

const ufmProfileColumns = [
    "ufm_profile_id",
    "ufm_profile_name",
    "ufm_profile_environment_id",
    "ufm_profile_primary_tenant_id", 
    "ufm_profile_secondary_tenant_id",
    "ufm_profile_gr_id",
    "ufm_profile_tenant_state_id",
    "created_by",
    "modified_by", 
]

const tenantTableColumns = [
    "tenant_id",
    "tenant_name",
    "tenant_description",
    "tenant_region_id",
    "tenant_host_url",
    "tenant_host_username",
    "tenant_host_password",
    "tenant_iv_salt",
    "tenant_host_test_status_id",
    "tenant_host_test_status_on",
    "tenant_environment_id",
    "tenant_state_id",
    "created_by",
    "modified_by"
]

module.exports = {
    userMasterColumns,
    gitMasterColumns,
    ufmProfileColumns,
    tenantTableColumns
}