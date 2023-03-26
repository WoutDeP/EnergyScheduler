import {Device} from "../Device.js";
import {showForm/*, showFormTemplate*/} from "./formFunctions.js";
/*
document.getElementById("templateConfirmForm").addEventListener("click", async (event) => {
    event.preventDefault();
    await addDevice();
    await showDevices();
});*/

//document.getElementById("addDevice").addEventListener('click', showFormTemplate);

//document.getElementById("templateDevices").addEventListener('change', showDevicesSmall);

export async function getStates() {
    const states = await axios.get('http://homeassistant.local:8123/api/states', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });

    const switches = [];
    states.data.forEach((state) => {
        if (state.entity_id.includes('switch')) {
            switches.push(state);
        }
    });

    window.devices = switches;
    return switches;
}

export async function getDevices() {
    const devices = await axios.get('http://homeassistant.local:3001/devices', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });

    return devices.data;
}


const postDevice = async device => {
    try {
        await axios.post(`http://homeassistant.local:3001/devices`, {
            id: device.id,
            friendly_name: device.friendly_name,
            state: device.state,
            consumption: device.consumption,
            startTime: device.startTime,
            endTime: device.endTime,
            duration: device.duration,
            obligatory: device.obligatory,
            importance: device.importance,
            splittable: device.splittable
        }, {
            headers: {
                'Authorization':
                    `Bearer ${window.token}`
            }
        }).then(() => {

        });
    } catch (errors) {
        console.error(errors);
        if (errors.response.data.contains("Error: Insert failed, duplicate id")) {
            document.getElementById("error-alert").innerHTML += "Error posting device, duplicate id";
        } else {
            document.getElementById("error-alert").innerHTML += "Error posting device";
        }
        document.getElementById("error-alert").style.display = "block";
    }
};

const putDevice = async device => {
    try {
        await axios.put(`http://homeassistant.local:3001/devices`, {
            id: device.id,
            friendly_name: device.friendly_name,
            state: device.state,
            consumption: device.consumption,
            startTime: device.startTime,
            endTime: device.endTime,
            duration: device.duration,
            obligatory: device.obligatory,
            importance: device.importance,
            splittable: device.splittable
        }, {
            headers: {
                'Authorization':
                    `Bearer ${window.token}`
            }
        }).then(() => {

        });
    } catch (errors) {
        console.error(errors);
        document.getElementById("error-alert").innerHTML += "Error putting device";
    }
};

async function deleteDevice(id) {
    try {
        await axios.delete(`http://homeassistant.local:3001/devices/${id}`, {
            headers: {
                'Authorization':
                    `Bearer ${window.token}`
            }
        }).then(response => {

        });
    } catch (errors) {
        console.error(errors);
    }

}


export async function showDevices() {
    const allDevices = document.getElementById("templates-list");
    let children = allDevices.children;
    for (let i = 0; i < children.length; i++) {
        children[i].style.backgroundColor = null;
        children[i].style.color = null;
    }
    const currentDevices = await axios.get('http://homeassistant.local:3001/devices', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });
    const listOfDevices = currentDevices.data;
    for (let i = 0; i < listOfDevices.length; i++) {
        for (let j = 0; j < children.length; j++) {
            if (children[j].innerHTML === listOfDevices[i].friendly_name) {
                children[j].style.backgroundColor = "#0070C0";
                children[j].style.color = "white";
            }
        }
    }
}

/*
export async function showTemplateDevices() {
    await getTemplateDevices();
    const entity_id = document.getElementById("templateDevices").value;
    const friendly_name = document.getElementById("templateDevices").options[document.getElementById("templateDevices").selectedIndex].text;
    const findDevice = window.templateDevices.find(x => x.id === entity_id);
    document.getElementById("templateStartTime").value = findDevice.startTime;
    document.getElementById("templateEndTime").value = findDevice.endTime;
    document.getElementById("templateConsumption").value = findDevice.consumption;
    document.getElementById("templateDuration").value = findDevice.duration;
    document.getElementById("templateImportance").value = findDevice.importance;
    if (findDevice.obligatory === "true") {
        document.getElementById("templateObligatory").checked = true;
    }
    if (findDevice.splittable === "true") {
        document.getElementById("templateSplittable").checked = true;
    }
}

export async function addDevice() {
    document.getElementById("deviceForm").style.display = 'none';
    const entity_id = document.getElementById("devices").value;
    const friendly_name = document.getElementById("devices").options[document.getElementById("devices").selectedIndex].text;
    const consumption = document.getElementById("consumption").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const chosenDevice = window.devices.filter(device => device.entity_id === entity_id);
    const duration = document.getElementById("duration").value;
    let obligatory = document.getElementById("obligatory");
    let obligatoryValue;
    if (obligatory.checked) {
        obligatoryValue = "true";
    } else {
        obligatoryValue = "false";
    }
    const importance = document.getElementById("importance").value;
    let splittable = document.getElementById("splittable");
    let splittableValue;
    if (splittable.checked) {
        splittableValue = "true";
    } else {
        splittableValue = "false";
    }
    const device = new Device(entity_id, friendly_name, chosenDevice[0].state, consumption, startTime, endTime, duration, obligatoryValue, importance, splittableValue);
    obligatory.checked = false;
    splittable.checked = false;
    await postDevice(device);
    if (window.templateDevices.find(x => x.id === entity_id) === undefined) {
        await postTemplateDevice(device);
    } else {
        await putTemplateDevice(device);
    }
}
*/
export async function getTemplateDevices() {
    const templateDevices = await axios.get('http://homeassistant.local:3001/templateDevices', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });
    window.templateDevices = templateDevices.data;
    return templateDevices.data;
}

export async function showTemplateDevices() {
    const templates = await getTemplateDevices();
    if (templates !== undefined) {
        const templatesList = document.getElementById("templates-list");
        for (let i = 0; i < templates.length; i++) {
            const templateli = document.createElement("li");
            templateli.className = "templates-list-item";
            templateli.innerText = templates[i].friendly_name;
            templateli.style.backgroundColor = null;
            templateli.style.color = null;
            const chosenDevices = await getDevices();
            for (let j = 0; j < chosenDevices.length; j++) {
                if (chosenDevices[j].friendly_name === templates[i].friendly_name) {
                    templateli.style.backgroundColor = "#0070C0";
                    templateli.style.color = "white";
                }
            }
            templatesList.appendChild(templateli);
            templateli.addEventListener('click', async function () {
                await changeSelectedDevices(templates[i]);
            });
        }
    }
}

async function changeSelectedDevices(device) {
    if (device !== undefined) {
        const allDevices = await document.querySelectorAll(".templates-list-item");
        let currentDevice;
        for (let i = 0; i < allDevices.length; i++) {
            if (allDevices[i].innerHTML === device.friendly_name) {
                currentDevice = allDevices[i];
            }
        }

        let selectedDevices = await getDevices();

        let hasname = false;
        console.log(device.id);
        for (let i = 0; i < selectedDevices.length; i++) {
            if (selectedDevices[i].id === device.id) {
                console.log(selectedDevices[i].id);
                console.log(selectedDevices[i]);
                hasname = true;
            }
        }

        console.log(hasname);

        if (hasname === false) {
            currentDevice.style.backgroundColor = "#0070C0";
            currentDevice.style.color = "white";
            await postDevice(device);
            await showForm(device);
        } else {
            currentDevice.style.backgroundColor = null;
            currentDevice.style.color = null;
            document.getElementById("template-container").style.display = "none";
            await deleteDevice(selectedDevices.find(x => x.id === device.id).id);
        }
        //TODO show template onclick li
    }
}

export async function addTemplateDevice() {
    let checkInputs = "";

    const entity_id = document.getElementById("templateDevices").value;
    const friendly_name = document.getElementById("templateDevices").options[document.getElementById("templateDevices").selectedIndex].text;
    const consumption = document.getElementById("templateConsumption").value;
    let startTime = document.getElementById("templateStartTime").value;
    let endTime = document.getElementById("templateEndTime").value;
    if (startTime > endTime) {
        checkInputs += "Start time must be before end time";
    }
    const duration = document.getElementById("templateDuration").value;
    let obligatory = document.getElementById("templateObligatory");
    let obligatoryValue;
    if (obligatory.checked) {
        obligatoryValue = "true";
    } else {
        obligatoryValue = "false";
    }
    let importance = document.getElementById("templateImportance").value;
    let splittable = document.getElementById("templateSplittable");
    let splittableValue;
    if (splittable.checked) {
        splittableValue = "true";
    } else {
        splittableValue = "false";
    }

    if (friendly_name === "" || consumption === "" || duration === "") {
        checkInputs += "Please fill in all * fields";
    }

    if (startTime === "" || endTime === "") {
        startTime = "00:00";
    }
    if (endTime === "") {
        endTime = "23:59";
    }
    if (importance === "") {
        importance = "0";
    }


    if (checkInputs === "") {
        const chosenDevice = window.devices.filter(device => device.entity_id === entity_id);
        const device = new Device(entity_id, friendly_name, chosenDevice[0].state, consumption, startTime, endTime, duration, obligatoryValue, importance, splittableValue);
        obligatory.checked = false;
        splittable.checked = false;

        const templates = document.getElementById("templates-list");
        let alreadyExists = false;
        console.log(friendly_name);
        console.log(templates.children);
        for (let i = 0; i < templates.children.length; i++) {
            if (templates.children[i].innerHTML === friendly_name) {
                alreadyExists = true;
            }
        }
        if (!alreadyExists) {
            const templateli = document.createElement("li");
            templateli.className = "templates-list-item";
            templateli.innerText = friendly_name;
            document.getElementById("templates-list").appendChild(templateli);
            templateli.addEventListener('click', async function () {
                await changeSelectedDevices(device);
            });
            document.getElementById("template-container").style.display = 'none';

            await postDevice(device);
            await postTemplateDevice(device);
            await showDevices();
        } else {
            console.log("already exists");
            await putDevice(device);
            await putTemplateDevice(device);
            await showDevices();
        }
    } else {
        document.getElementById("error-alert").style.display = "block";
        document.getElementById("error-alert").innerHTML += checkInputs;
    }
}

async function postTemplateDevice(device) {
    try {
        await axios.post(`http://homeassistant.local:3001/templateDevices`, {
            id: device.id,
            friendly_name: device.friendly_name,
            consumption: device.consumption,
            startTime: device.startTime,
            endTime: device.endTime,
            duration: device.duration,
            obligatory: device.obligatory,
            importance: device.importance,
            splittable: device.splittable
        }, {
            headers: {
                'Authorization':
                    `Bearer ${window.token}`
            }
        }).then(response => {

        });
    } catch (errors) {
        console.error(errors);
        document.getElementById("error-alert").style.display = "block";
        document.getElementById("error-alert").innerHTML += "Error posting templateDevice";
    }

}

async function putTemplateDevice(device) {
    try {
        await axios.put(`http://homeassistant.local:3001/templateDevices/${device.id}`, {
            id: device.id,
            friendly_name: device.friendly_name,
            consumption: device.consumption,
            startTime: device.startTime,
            endTime: device.endTime,
            duration: device.duration,
            obligatory: device.obligatory,
            importance: device.importance,
            splittable: device.splittable
        }, {
            headers: {
                'Authorization':
                    `Bearer ${window.token}`
            }
        }).then(response => {

        });
    } catch (errors) {
        console.error(errors);
        document.getElementById("error-alert").style.display = "block";
        document.getElementById("error-alert").innerHTML += "Error putting device";
    }

}