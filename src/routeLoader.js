// routeLoader.js

const express = require('express');
const router = express.Router();

// health Check route
// router.use("/", require("./routes/healthRouter"));

// Routes -> the sequence of routes is important
router.use("/integrationPackages", require("./routes/integrationPackagesRouter"));
router.use("/gitRepository", require("./routes/gitRepositoryRouter"));
router.use("/gitActivity", require("./routes/gitActivityRouter"));
router.use("/tenantAction", require("./routes/tenantActionRouter"));
router.use("/tenant", require("./routes/tenantMasterRouter"));
router.use("/taxonomy", require("./routes/taxonomyRouter"));
router.use("/ufm", require("./routes/ufmProfileRouter"));
router.use("/userMaster", require("./routes/userMasterRouter"));


module.exports = router;