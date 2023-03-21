import {addTemplateDevice, showDevices, showTemplateDevices} from "./deviceFunctions.js";


document.getElementById("templateConfirmForm").addEventListener("click", async (event) => {
    event.preventDefault();
    await addTemplateDevice();
    await showDevices();
});


export async function showForm() {
    document.getElementById("deviceForm").style.display = 'block';
    document.getElementById("templateForm").style.display = 'none';
    const selectList = document.getElementById("devices");
    while (selectList.firstChild) {
        selectList.removeChild(selectList.firstChild);
    }
    for (let i = 0; i < window.devices.length; i++) {
        const option = document.createElement("option");
        option.value = window.devices[i].entity_id;
        option.text = window.devices[i].attributes.friendly_name;
        selectList.appendChild(option);
    }
    document.getElementById("startTime").value = 0;
    document.getElementById("endTime").value = 0;
    document.getElementById("consumption").value = 0;
    document.getElementById("duration").value = 0;
    document.getElementById("importance").value = 0;
}

export async function showFormTemplate() {
    document.getElementById("templateForm").style.display = 'block';
    document.getElementById("deviceForm").style.display = 'none';
    const selectList = document.getElementById("templateDevices");
    while (selectList.firstChild) {
        selectList.removeChild(selectList.firstChild);
    }
    for (let i = 0; i < window.templateDevices.length; i++) {
        const option = document.createElement("option");
        option.value = window.templateDevices[i].id;
        option.text = window.templateDevices[i].friendly_name;
        selectList.appendChild(option);
    }
    await showTemplateDevices();
}