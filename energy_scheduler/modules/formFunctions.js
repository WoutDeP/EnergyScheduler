import {addTemplateDevice/*, showTemplateDevices*/} from "./deviceFunctions.js";


document.getElementById("templateConfirmForm").addEventListener("click", async (event) => {
    event.preventDefault();
    await addTemplateDevice();
});

document.getElementById("addNewDevice").addEventListener('click', function(event) {
    event.stopPropagation();
    showForm();
});
export async function showForm(device) {
    document.getElementById("template-container").style.display = 'flex';
    const selectList = document.getElementById("templateDevices");
    while (selectList.firstChild) {
        selectList.removeChild(selectList.firstChild);
    }
    for (let i = 0; i < window.devices.length; i++) {
        const option = document.createElement("option");
        option.value = window.devices[i].entity_id;
        option.text = window.devices[i].attributes.friendly_name;
        selectList.appendChild(option);
    }
    if (device !== undefined) {
        document.getElementById("templateDevices").value = device.id;
        document.getElementById("templateDevices").options[document.getElementById("templateDevices").selectedIndex].text = device.friendly_name;
        document.getElementById("templateConsumption").value = device.consumption;
        document.getElementById("templateStartTime").value = device.startTime;
        document.getElementById("templateEndTime").value = device.endTime;
        document.getElementById("templateDuration").value = device.duration;
        document.getElementById("templateImportance").value = device.importance;
        if (device.obligatory === "true") {
            document.getElementById("templateObligatory").checked = true;
        }
        if (device.splittable === "true") {
            document.getElementById("templateSplittable").checked = true;
        }
    } else {
        document.getElementById("templateDevices").value = null;
        document.getElementById("templateConsumption").value = null;
        document.getElementById("templateStartTime").value = null;
        document.getElementById("templateEndTime").value = null;
        document.getElementById("templateDuration").value = null;
        document.getElementById("templateObligatory").checked = false;
        document.getElementById("templateImportance").value = null;
        document.getElementById("templateSplittable").checked = false;
    }
}

/*
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
}*/