const express = require("express");
const morgan =require( "morgan");
const winston = require( "winston");
const logRequest = require("./src/middlewares/print");
const routeLoader = require("./src/routeLoader");
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


// Production -> I will have to write a syncModel in order to make all tables simultaneously
async function syncModels() {
    try {
        // await UFMProfile.sync({ force: true});
        // await UserModel.sync( { force: true})
        // await Tenant.sync({ force: true });
        // await GitRepository.sync({ force: true});

        // await UFMFailoverConfigState.sync({ force: true});
        // await UFMFailoverConfig.sync({ force: true});

        // await UFMProfile.sync({ force: true});
        // await UFMProfileRuntimeMap.sync({ force: true});
        // await UFMSyncHeader.sync({ force: true});
        // await UFMSyncDetail.sync( { force: true});

    } catch (error) {
        console.error('Error syncing models:', error);
    }
}

// syncModels(); 

const app = express();

const PORT = 8080;
app.use(express.json());

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));
app.use(logRequest);

// All routes
app.use("/firebird/", routeLoader);
// If the route is not found
app.use(function (req, res, next) {
    console.log('route not found');
    res.status(404).json({ message: 'Route Not Found' });
    next();
})

// General logger for Error in application
app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).json({ message: 'Server.js: Internal Server Error' });
    next();
})


app.listen(PORT, ()=> {
    console.log(`Server is running on port: ${PORT}`)
})


