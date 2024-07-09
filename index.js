const express = require("express");
const morgan =require( "morgan");
const winston = require( "winston");
const logRequest = require("./src/middlewares/print");
const routeLoader = require("./src/routeLoader");
const nodeCron = require("node-cron");
const {processFailoverJob} = require("./src/cron/failover")
// Do all these table DB things separately
const Tenant = require("./src/models/tenant");
const GitRepository = require("./src/models/gitRepository");
const Taxonomy = require("./src/models/taxonomy");
const UFMProfile = require("./src/models/ufmProfile");
const UFMFailoverConfigState = require("./src/models/UFM/ufmFailoverConfigState");
const UFMFailoverConfig = require("./src/models/UFM/ufmFailoverConfig");
const UFMProfileRuntimeMap = require("./src/models/UFM/ufmProfileRuntimeMap");
const UserModel = require("./src/models/userModel");
const UFMSyncDetail = require("./src/models/UFM/ufmSyncDetail");
const UFMSyncHeader = require("./src/models/UFM/ufmSyncHeader");
const UFMFailoverProcess = require("./src/models/UFM/ufmFailoverProcess");
const UFMFailoverProcessComponent = require("./src/models/UFM/ufmFailoverProcessComponent");
const bodyParser = require("body-parser");

// Production -> I will have to write a syncModel in order to make all tables simultaneously
async function syncModels() {
    try {
     
        // await UFMFailoverProcess.sync({ force: true });
        // await UFMFailoverProcessComponent.sync({ force: true });
        // await UFMFailoverConfig.sync({ force: true});

    } catch (error) {
        console.error('Error syncing models:', error);
    }
}

// syncModels(); 

const app = express();

const PORT = 8080;

// Parse URL-encoded bodies (for form data)
app.use(express.json({ limit: "50mb", extended: true, parameterLimit: 5000000 }))
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 5000000 }))


// All routes
app.use("/firebird/", routeLoader);

// node-cron to perform failover processing 
nodeCron.schedule('* * * * *', processFailoverJob );

// If the route is not found
app.use(function (req, res, next) {
    console.log('route not found');
    res.status(404).json({ message: 'Route Not Found' });
    next();
})

// General logger for Error in application
app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).json({ message: 'Index.js: Internal Server Error', error: err.message });
    next();
})


app.listen(PORT, ()=> {
    console.log(`Server is running on port: ${PORT}`)
})


