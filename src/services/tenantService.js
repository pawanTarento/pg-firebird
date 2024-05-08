const Tenant = require("../models/tenant");
const {tenantTableColumns} = require("../constants/tableColumns")
const getAllTenants = async (req, res) => {

    let response = await Tenant.findAll( {
        where: {},
        attributes: tenantTableColumns
    })

    if (!response) {
        return res.status(400).json({ message: "No Tenants to show"})
    }
    return res.status(200).json({ data: response});
}


const getTenantById = async (req, res, tenantId) => {
    let response = await Tenant.findOne( {
        where: { tenant_id: tenantId},
        attributes: tenantTableColumns
    })

    if ( !response) {
        return res.status(400).json({ message: "No data for given id"})
    }
    return res.status(200).json({ data: response});

}

const removeTenant = async (req, res, tenantId) => {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
    } else {
      await tenant.destroy();
      res.status(204).end();
    }
}

const addTenant = async ( req, res) => {
    try {
        const { 
          tenant_id,
          tenant_name,
          tenant_description,
          tenant_region_id,
          tenant_host_url,
          tenant_host_username,
          tenant_host_password,
          tenant_iv_salt,
          tenant_host_test_status_id,
          tenant_host_test_status_on,
          tenant_environment_id,
          tenant_state_id,
          created_by,
          modified_by,
         } = req.body;
        const user = await Tenant.create({ 
          tenant_id,
          tenant_name,
          tenant_description,
          tenant_region_id,
          tenant_host_url,
          tenant_host_username,
          tenant_host_password,
          tenant_iv_salt,
          tenant_host_test_status_id,
          tenant_host_test_status_on,
          tenant_environment_id,
          tenant_state_id,
          created_by,
          modified_by,
        });
        res.status(201).json(user);
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

const updateTenantDetails = async (req, res) => {
    const { tenant_id } = req.body;
    console.log('tenant_id: ', tenant_id)
    try {
        const tenant = await Tenant.findByPk(tenant_id);
        if (!tenant) {
          res.status(404).json({ error: 'Tenant not found...' });
        } else {
          const { 
            tenant_name,
            tenant_description,
            tenant_region_id,
            tenant_host_url,
            tenant_host_username,
            tenant_host_password,
            tenant_iv_salt,
            tenant_host_test_status_id,
            tenant_host_test_status_on,
            tenant_environment_id,
            tenant_state_id,
            created_by,
            modified_by, } = req.body;
          await tenant.update({ 
            tenant_id,
            tenant_name,
            tenant_description,
            tenant_region_id,
            tenant_host_url,
            tenant_host_username,
            tenant_host_password,
            tenant_iv_salt,
            tenant_host_test_status_id,
            tenant_host_test_status_on,
            tenant_environment_id,
            tenant_state_id,
            created_by,
            modified_by,
           });
          res.json(tenant);
        }
      } catch (error) {
        console.error('Error updating tenant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

}

module.exports = {
    getAllTenants,
    getTenantById,
    removeTenant,
    updateTenantDetails,
    addTenant
}