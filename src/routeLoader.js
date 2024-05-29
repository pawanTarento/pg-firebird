// routeLoader.js

const express = require('express');
const router = express.Router();

// health Check route
// router.use("/", require("./routes/healthRouter"));

// Routes -> the sequence of routes is important
router.use("/integrationPackages", require("./routes/integrationPackagesRouter"));
router.use("/gitRepository", require("./routes/gitRepositoryRouter"));
router.use("/gitAction", require("./routes/gitActionRouter"));
router.use("/tenantAction", require("./routes/tenantActionRouter"));
router.use("/tenant", require("./routes/tenantMasterRouter"));
router.use("/taxonomy", require("./routes/taxonomyRouter"));
router.use("/ufm", require("./routes/ufmProfileRouter"));
router.use("/userMaster", require("./routes/userMasterRouter"));
router.use('/tokens', require("./routes/tokenProviderRouter"));
router.use("/failoverConfig", require("./routes/ufmFailoverConfigRouter"));
router.use("/failoverConfigState",require("./routes/ufmFailoverConfigStateRouter"));
router.use("/runtime", require("./routes/runtimeArtifactsRouter"));
router.use("/ufmProfileRuntime", require("./routes/ufmProfileRuntimeMapRouter"));


module.exports = router;