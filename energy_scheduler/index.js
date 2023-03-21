import {
    getDevices,
    getTemplateDevices,
    showDevices,
} from "./modules/deviceFunctions.js";
import {showSchedule} from "./modules/scheduleFunctions.js";
import {getSolarData} from "./modules/solarDataFunctions.js";

async function getOptions(){
    await fetch('data.json', {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("Data: ");
            console.log(data);
            console.log("Options: ");
            console.log(data.options);
            console.log("Token: ");
            console.log(data.options.token);
            window.token = data.options.token;
            window.latitude = data.options.latitude;
            window.longitude=data.options.longitude;
            window.declination=data.options.declination;
            window.azimuth=data.options.azimuth;
            window.kwph=data.options.kwph;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

await getOptions();
await getSolarData(window.latitude, window.longitude, window.declination, window.azimuth, window.kwph);
await getDevices();
await getTemplateDevices();
await showDevices();
await showSchedule();


