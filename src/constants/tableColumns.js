const userMasterColumns =[
    "user_id",
    "email_id",
    "first_name",
    "last_name",
    "display_name",
    "external_id",
    "additional_param1",
    "created_on",
    "created_by",
    "modified_on",
    "modified_by",
    "is_active",
    "is_admin",
    "first_logged_on",
    "last_logged_on",
    "role",
    "timezone_id"
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
    "modified_by",
    "created_on",
    "modified_on"
];

const ufmProfileColumns = [
    "ufm_profile_id",
    "ufm_profile_name",
    "ufm_profile_environment_id",
    "ufm_profile_primary_tenant_id", 
    "ufm_profile_secondary_tenant_id",
    "ufm_profile_gr_id",
    "ufm_profile_tenant_state_id",
    "ufm_profile_source_runtime",
    "ufm_profile_destination_runtime",
    "created_by",
    "modified_by", 
    "created_on",
    "modified_on"
]

const tenantTableColumns = [
    "tenant_id",
    "tenant_name",
    "tenant_description",
    "tenant_region_id",
    "tenant_host_url",
    "tenant_host_token_api",
    "tenant_iflow_host_url",
    "tenant_host_username",
    "tenant_host_password",
    "tenant_iv_salt",
    "tenant_host_test_status_id",
    "tenant_host_test_status_on",
    "tenant_util_host_url",
    "tenant_util_token_url",
    "tenant_util_client_id",
    "tenant_util_client_secret",
    "tenant_util_iv_salt",
    "tenant_environment_id",
    "tenant_state_id",
    "created_by",
    "modified_by",
    "modified_on",
    "created_on"
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

const UFMFailoverConfigTableColumns = [
    "config_id",
    "config_state_id",
    "ufm_profile_id",
    "config_component_row_select",
    "config_component_group_name",
    "config_component_group_order",
    "config_component_position",
    "config_package_id",
    "config_package_name",
    "config_package_version",
    "config_package_description",
    "config_package_short_text",
    "config_package_supported_platform",
    "config_component_id",
    "config_component_name",
    "config_component_dt_version",
    "config_component_rt_version",
    "config_component_resource_id",
    "config_component_description",
    "config_component_status",
    "config_component_status_text",
    "config_component_deployed_by",
    "config_component_deployed_on",
    "config_timestamp",
    "ufm_profile_runtime_map_id",
    "primary_runtime_id",
    "primary_runtime_display_name",
    "primary_runtime_type",
    "primary_runtime_type_id",
    "primary_runtime_state",
    "config_component_created_by",
    "config_component_created_on",
    "config_component_modified_by",
    "config_component_modified_on",
    "is_draft",
    "is_deleted"
];

const UFMProfileRuntimeTableColumns = [
    "ufm_profile_runtime_map_id",
    "ufm_profile_id",
    "primary_runtime_id",
    "primary_runtime_display_name",
    "primary_runtime_type",
    "primary_runtime_type_id",
    "primary_runtime_state",
    "secondary_runtime_id",
    "secondary_runtime_display_name",
    "secondary_runtime_type",
    "secondary_runtime_type_id",
    "secondary_runtime_state",
    "created_on",
    "created_by",
    "modified_on",
    "modified_by",
    "is_deleted"
]

const UFMSyncHeaderTableColumns= [
    "ufm_sync_header_id",
    "ufm_profile_id",
    "ufm_last_synced_on",
    "ufm_component_type_id",
    "is_last_record",
    "created_on",
    "created_by",
    "modified_on",
    "modified_by",
]

const UFMFailoverProcessTableColumns = [
    "failover_process_id",
    "config_state_id",
    "ufm_profile_id",
    "is_last_record",
    "entry_type_id",
    "is_process_initiated_progress_id",
    "process_started_on",
    "process_started_by",
    "process_completed_on",
    "created_on",
    "created_by"
]

const UFMFailoverProcessComponentTableColumns = [
    "failover_process_component_id",
    "failover_process_id",
    "config_id",
    "config_package_id",
    "config_component_id",
    "config_component_group_name",
    "config_component_group_order",
    "config_component_position",
    "config_component_dt_version",
    "primary_tenant_runtime_status",
    "primary_tenant_runtime_error",
    "primary_tenant_runtime_started_on",
    "primary_tenant_runtime_completed_on",
    "primary_tenant_runtime_status_last_updated_on",
    "secondary_tenant_runtime_status",
    "secondary_tenant_runtime_error",
    "secondary_tenant_runtime_started_on",
    "secondary_tenant_runtime_completed_on",
    "secondary_tenant_runtime_status_last_updated_on",
    "created_on",
    "created_by"
]


module.exports = {
    userMasterColumns,
    gitMasterColumns,
    ufmProfileColumns,
    tenantTableColumns,
    taxonomyTableColumns,
    UFMFailoverConfigStateTableColumns,
    UFMFailoverConfigTableColumns,
    UFMProfileRuntimeTableColumns,
    UFMSyncHeaderTableColumns,
    UFMFailoverProcessTableColumns,
    UFMFailoverProcessComponentTableColumns
}