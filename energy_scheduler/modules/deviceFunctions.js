import {Device} from "../Device.js";
import {showForm, showFormTemplate} from "./formFunctions.js";

document.getElementById("confirmForm").addEventListener("click", async (event) => {
    event.preventDefault();
    await addDevice();
    await showDevices();
});

document.getElementById("addNewDevice").addEventListener('click', showForm);
document.getElementById("addDevice").addEventListener('click', showFormTemplate);
document.getElementById("templateDevices").addEventListener('change', showTemplateDevices);

export async function getDevices() {
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

export const postDevice = async device => {
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
        }).then(response => {

        });
    } catch (errors) {
        console.error(errors);
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
    const list = document.getElementById("list");
    let children = list.children;
    while (children.length > 0) {
        list.removeChild(children[0]);
    }
    const myDevices = await axios.get('http://homeassistant.local:3001/devices', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });
    const listOfDevices = myDevices.data;
    for (let i = 0; i < listOfDevices.length; i++) {
        const device = new Device(listOfDevices[i].id, listOfDevices[i].friendly_name, listOfDevices[i].state);
        const listItem = document.createElement("li");

        const button = document.createElement("button");
        button.innerText = "X";
        button.addEventListener("click", async (event) => {
            event.preventDefault();
            await deleteDevice(device.id);
            await showDevices();
        });


        listItem.innerText = device.friendly_name;
        listItem.appendChild(button);
        list.appendChild(listItem);
    }
    window.myDevices = listOfDevices;
    const selectList = document.getElementById("devices");
    while (selectList.childNodes.length > 0) {
        selectList.removeChild(selectList.lastChild);
    }
}

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

export async function getTemplateDevices() {
    const templateDevices = await axios.get('http://homeassistant.local:3001/templateDevices', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });
    window.templateDevices = templateDevices.data;
}

export async function addTemplateDevice() {
    document.getElementById("templateForm").style.display = 'none';
    const entity_id = document.getElementById("templateDevices").value;
    const friendly_name = document.getElementById("templateDevices").options[document.getElementById("templateDevices").selectedIndex].text;
    const consumption = document.getElementById("templateConsumption").value;
    const startTime = document.getElementById("templateStartTime").value;
    const endTime = document.getElementById("templateEndTime").value;
    const chosenDevice = window.devices.filter(device => device.entity_id === entity_id);
    const duration = document.getElementById("templateDuration").value;
    let obligatory = document.getElementById("templateObligatory");
    let obligatoryValue;
    if (obligatory.checked) {
        obligatoryValue = "true";
    } else {
        obligatoryValue = "false";
    }
    const importance = document.getElementById("templateImportance").value;
    let splittable = document.getElementById("templateSplittable");
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
    await putTemplateDevice(device);
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
    }

}