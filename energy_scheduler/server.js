'use strict';

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('data.json');
const middlewares = jsonServer.defaults();
const axios = require('axios');

const addonConfig  = require('/data/options');

const myOptionValue = addonConfig.auth_token;
const latitude = addonConfig.latitude;
const longitude = addonConfig.longitude;
const declination = addonConfig.declination;
const azimuth = addonConfig.azimuth;
const kwph = addonConfig.kwph;

server.use(middlewares);
server.use(router);

const PORT = 3001;

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});


const express = require('express');
const app = express();

//if async => call back
const path = require('path');
const port = process.env.PORT || 8099; // use the port defined in the environment variable, or 8080 by default

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
const {exec} = require('child_process');

// Run JAR application on port 8080
const jarProcess = exec('java -jar demo.jar --server.port=8080');


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

axios.post(`http://homeassistant.local:3001/options`, {
    token: myOptionValue,
    latitude: latitude,
    longitude: longitude,
    declination: declination,
    azimuth: azimuth,
    kwph: kwph
    }, {
        headers: {
            'Authorization':
                `Bearer ${myOptionValue}`
        }
    }).then(response => {

    });
