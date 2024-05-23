const userMasterColumns =[
    "user_id",
    "email_id",
    "firstname",
    "lastname",
    "display_name",
    "external_id",
    "is_active",
    "additional_param1",
    "role",
    "isAdmin"
];

const gitMasterColumns = [
    "gr_id",
    "gr_owner_name",
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
    "tenant_host_token_api",
    "tenant_host_username",
    "tenant_host_password",
    "tenant_iv_salt",
    "tenant_host_test_status_id",
    "tenant_host_test_status_on",
    "tenant_environment_id",
    "tenant_state_id",
    "created_by",
    "modified_by"
];

const taxonomyTableColumns =[ 
    "taxonomy_id",
    "asset_id",
    "asset_url",
    "group_name",
    "taxonomy_code",
    "taxonomy_name",
    "taxonomy_value",
    "taxonomy_numeric",
    "taxonomy_type",
    "taxonomy_category",
    "additional_param_1",
    "additional_param_2",
    "is_active",
    "is_deleted",
    "priority_order",
    "parent_id",
    "created_by"
]

const UFMFailoverConfigStateTableColumns = [
    "config_state_id",
    "ufm_profile_id",
    "config_state_saved_on",
    "short_comment",
    "is_last_record",
    "created_by",
    "created_on",
    "modified_by",
    "modified_on"
];

const UFMFailoverConfigTableColumns=[
    "config_id",
    "config_state_id",
    "ufm_profile_id",
    "config_component_row_select",
    "config_component_group_name",
    "config_component_group_order",
    "config_component_position",
    "config_component_version",
    "config_component_name",
    "config_component_id",
    "config_component_package_id",
    "config_component_resource_id",
    "config_component_description",
    "config_component_short_text",
    "config_component_mode",
    "config_component_created_by",
    "config_component_created_on",
    "config_component_modified_by",
    "config_component_modified_on",
    "config_timestamp",
    "is_draft",
    "is_deleted"
]

module.exports = {
    userMasterColumns,
    gitMasterColumns,
    ufmProfileColumns,
    tenantTableColumns,
    taxonomyTableColumns,
    UFMFailoverConfigStateTableColumns,
    UFMFailoverConfigTableColumns
}