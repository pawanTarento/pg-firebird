const express = require("express");
const morgan =require( "morgan");
const winston = require( "winston");
const logRequest = require("./src/middlewares/print");
const routeLoader = require("./src/routeLoader");
// Do all these table DB things separately
const Tenant = require("./src/models/tenant");
const GitRepository = require("./src/models/gitRepository");
const Taxonomy = require("./src/models/taxonomy");

// const UFMProfile = require("./src/models/ufmProfile");
// const UFMFailoverConfig = require('./src/models/UFM/ufmFailoverConfig');
// const UFMFailoverConfigState = require('./src/models/UFM/ufmFailoverConfigState');

async function syncModels() {
    try {
        await UFMProfile.sync({ force: true });
        await UFMFailoverConfig.sync({ force: true });
        await UFMFailoverConfigState.sync({ force: true });
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


