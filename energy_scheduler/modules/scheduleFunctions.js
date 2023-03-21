import {Schedule} from "../Schedule.js";
import {createEnergyComparison} from "./energyFunctions.js";

document.getElementById("createSchedule").addEventListener("click", async (event) => {
    event.preventDefault();
    await createSchedule();
});

export async function createSchedule() {
    const loader = document.getElementById("loader");
    const error = document.getElementById("error");
    loader.style.display = 'block';
    let schedule;
    const startSchedule = document.getElementById("startSchedule").value;
    const endSchedule = document.getElementById("endSchedule").value;
    if (startSchedule === "" || endSchedule === "") {
        error.style.display = 'block';
        loader.style.display = 'none';
        return;
    }
    /* [{
         timeForWattage: "2021-08-01T07:00:00.000",
         wattage: 1000
     }]*/
    let wattHoursPeriod = window.solarData[0].watt_hours_period;
    let mySolarWattageList = [];
    for (let i = 0; i < wattHoursPeriod.length; i++) {
        let date = window.solarData[0].id;
        let year = date.split("-")[0];
        let month = date.split("-")[1];
        let day = date.split("-")[2];
        if (month < 10)
            month = "0" + month;

        let time = year + "-" + month + "-" + day + "T" + wattHoursPeriod[i].timeForWattage + ".000";
        let solarWattage = {
            timeForWattage: time,
            wattage: wattHoursPeriod[i].wattage
        }
        mySolarWattageList.push(solarWattage);
    }
    error.style.display = 'none';
    try {
        await axios.post(`http://homeassistant.local:8080/api/schedule`, {
            deviceList: window.myDevices,
            startTime: startSchedule,
            endTime: endSchedule,
            solarWattageList: mySolarWattageList
        }, {
            headers: {
                'Authorization':
                    `Bearer ${window.token}`
            }
        }).then(response => {
            schedule = response.data;
        });
    } catch (errors) {
        console.error(errors);
    }
    const scheduleList = schedule.deviceUsageDtos;
    await deleteSchedule();

    for (let i = 0; i < scheduleList.length; i++) {
        if (scheduleList[i].start !== null) {
            const schedule = new Schedule(i, scheduleList[i].start, scheduleList[i].end, scheduleList[i].name, scheduleList[i].wattage);
            await postSchedule(schedule);
        }
    }
    await showSchedule();
    loader.style.display = 'none';

}

export const deleteSchedule = async () => {
    const scheduleList = await getSchedule();
    for (let i = 0; i < scheduleList.length; i++) {
        try {
            await axios.delete(`http://homeassistant.local:3001/schedule/${scheduleList[i].id}`, {
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
};

export const postSchedule = async schedule => {
    try {
        await axios.post(`http://homeassistant.local:3001/schedule`, {
            id: schedule.id + 1,
            name: schedule.name,
            wattage: schedule.wattage,
            start: schedule.start,
            end: schedule.end,
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

async function getSchedule() {
    const mySchedule = await axios.get('http://homeassistant.local:3001/schedule', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });
    return mySchedule.data;
}

function removeDuplicates(arr) {
    return arr.filter((item,
                       index) => arr.indexOf(item) === index);
}

export async function showSchedule() {
    const scheduleList = await getSchedule();
    let times = [];
    if (scheduleList.length > 0) {
        for (let i = 0; i < scheduleList.length; i++) {
            if (scheduleList[i].start !== null) {
                times.push(scheduleList[i].start);
                times.push(scheduleList[i].end);
            }
        }
    }
    let allTimes = removeDuplicates(times).sort();

    await loadTimeline(scheduleList);
    await createEnergyComparison(allTimes, scheduleList);
}

async function loadTimeline(devices) {
    let container = document.getElementById('visualization');
    let children = container.children;
    for (let i = 0; i < children.length; i++) {
        container.removeChild(children[i]);
    }
    let groupDevices = [];
    let itemDevices = [];
    let timeList = [];
    let allTimes = [];
    let date = new Date();
    for (let i = 0; i < devices.length; i++) {
        let month;
        if (date.getMonth() + 1 < 10)
            month = "0" + (date.getMonth() + 1);
        else
            month = (date.getMonth() + 1);
        let startTime = date.getFullYear() + "-" + month + "-" + date.getDate() + "T" + devices[i].start;
        let endTime = date.getFullYear() + "-" + month + "-" + date.getDate() + "T" + devices[i].end;
        let groupDevice = {
            id: devices[i].id,
            content: devices[i].name,
        }
        let wattage = devices[i].wattage / 1000;
        let itemDevice = {
            id: devices[i].id,
            group: devices[i].id,
            content: wattage.toString(),
            start: startTime,
            end: endTime
        }
        groupDevices.push(groupDevice);
        itemDevices.push(itemDevice);
        let startHour = parseInt(devices[i].start.split(':')[0]);
        let endHour = parseInt(devices[i].end.split(':')[0]);
        let startMinute = parseInt(devices[i].start.split(':')[1]);
        let endMinute = parseInt(devices[i].end.split(':')[1]);
        let minutesOfStartTime = startHour * 60 + startMinute;
        let minutesOfEndTime = endHour * 60 + endMinute;
        for (let j = 0; j < minutesOfEndTime - minutesOfStartTime; j++) {
            allTimes.push(minutesOfStartTime + j + 1);
        }
    }
    let data = new vis.DataSet({});
    for (let i = 0; i < groupDevices.length; i++) {
        data.add(groupDevices[i]);
    }


    let groups = new vis.DataSet(groupDevices);
    let items = new vis.DataSet(itemDevices);

    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    let startTimeline = +date;
    let endTimeline = +date + 86400000;

// Configuration for the Timeline
    let options = {
        min: startTimeline,
        max: endTimeline,
        start: startTimeline,
        end: endTimeline,
        zoomMax: 86399999,
        zoomMin: 10,
        orientation: 'top',

    }

// Create a Timeline
    let timeline = new vis.Timeline(container, null, options);
    timeline.setGroups(groups);
    timeline.setItems(items);
}