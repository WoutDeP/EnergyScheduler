'use strict';

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('data.json');
const middlewares = jsonServer.defaults();
const axios = require('axios');
const async = require('async');
const {exec} = require('child_process');
const express = require('express');
const app = express();
const addonConfig = require('/data/options');
//if async => call back
const path = require('path');

const supervisor_token = process.env.SUPERVISOR_TOKEN;
const port = process.env.PORT || 8099; // use the port defined in the environment variable, or 8080 by default
const addon_name = 'local_energy_scheduler';
const myOptionValue = addonConfig.auth_token;
const latitude = addonConfig.latitude;
const longitude = addonConfig.longitude;
const declination = addonConfig.declination;
const azimuth = addonConfig.azimuth;
const kwph = addonConfig.kwph;
let dataPort;
let backendPort;

async function getAddonInfo() {
    let addonData;
    await axios.get(`http://supervisor/addons/${addon_name}/info`, {
        headers: {
            'Authorization': 'Bearer ' + supervisor_token
        }
    })
        .then(response => {
            addonData = response.data;
        })
        .catch(error => {
            console.error(error);
        });
    console.log("Supervisor Token");
    console.log(supervisor_token);
    console.log("Addon Data");
    console.log(addonData);
    dataPort = addonData.data.network["3001/tcp"];
    backendPort = addonData.data.network["8080/tcp"];
    console.log(dataPort);
    console.log(backendPort);
    await startServers();
    await postOptions();
}

(async () => {
    try {
        await getAddonInfo();
    } catch (error) {
        console.error(error);
    }
})();

async function startServers(){
    server.use(middlewares);
    server.use(router);

    console.log("Starting servers");
    console.log(dataPort);

   /* const PORT = 3001;*/

    server.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    server.listen(dataPort, () => {
        console.log(`JSON Server is running on port ${dataPort}`);
    });




// serve the index.html file
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

// serve the static files
    app.use(express.static(path.join(__dirname)));

// start the server
    app.listen(port, () => {
        console.log(`Server listening on port ${port}!`);
    });


//jar


// Run JAR application on port 8080
    const jarProcess = exec(`java -jar demo.jar --server.port=${backendPort}`);


// Log output from JAR application
    jarProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    jarProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    jarProcess.on('close', (code) => {
        console.log(`JAR application exited with code ${code}`);
    });

}


async function postOptions(){
    axios.post(`http://homeassistant.local:${dataPort}/options`, {
        token: myOptionValue,
        latitude: latitude,
        longitude: longitude,
        declination: declination,
        azimuth: azimuth,
        kwph: kwph,
        dataPort: dataPort,
        backendPort: backendPort
    }, {
        headers: {
            'Authorization':
                `Bearer ${supervisor_token}`
        }
    }).then(response => {

    });
}





