import {
    getStates,
    getTemplateDevices,
    showTemplateDevices
} from "./modules/deviceFunctions.js";
import {getSolarData} from "./modules/solarDataFunctions.js";

async function getOptions() {
    await fetch('data.json', {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            window.token = data.options.token;
            window.latitude = data.options.latitude;
            window.longitude = data.options.longitude;
            window.declination = data.options.declination;
            window.azimuth = data.options.azimuth;
            window.kwph = data.options.kwph;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("error-alert").style.display = "block";
            document.getElementById("error-alert").innerHTML += "Error getting user options: please check your configurations";
        });
}

await getOptions();
await getSolarData(window.latitude, window.longitude, window.declination, window.azimuth, window.kwph);
await getStates();
await getTemplateDevices();
await showTemplateDevices();
