// routeLoader.js

const express = require('express');
const router = express.Router();

// health Check route
// router.use("/", require("./routes/healthRouter"));

// Routes -> the sequence of routes is important
router.use("/integrationPackages", require("./routes/integrationPackagesRouter"));
router.use("/gitRepository", require("./routes/gitRepositoryRouter"));
router.use("/gitActivity", require("./routes/gitActivityRouter"));
router.use("/tenant", require("./routes/tenantMasterRouter"));
router.use("/ufm", require("./routes/ufmProfileRouter"));
router.use("/user", require("./routes/userMasterRouter"));


module.exports = router;