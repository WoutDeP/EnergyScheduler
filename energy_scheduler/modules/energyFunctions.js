import {getSolarData} from "./solarDataFunctions.js";

function calculateEnergyUsed(allTimes, scheduleList) {
    let energyUsed = [];
    let hour = 0;
    let minute = 0;
    let stop = false;
    while (!stop) {
        let consumption = 0;
        for (let j = 0; j < scheduleList.length; j++) {
            let timeConsumption = 0;
            const hours = parseInt(scheduleList[j].end.split(':')[0]) - parseInt(scheduleList[j].start.split(':')[0]);
            const minutes = parseInt(scheduleList[j].end.split(':')[1]) - parseInt(scheduleList[j].start.split(':')[1]);
            let durationOfDevice = hours * 60 + minutes;

            let startMinutes = parseInt(scheduleList[j].start.split(':')[0]) * 60 + parseInt(scheduleList[j].start.split(':')[1]);
            let endMinutes = parseInt(scheduleList[j].end.split(':')[0]) * 60 + parseInt(scheduleList[j].end.split(':')[1]);
            let currentTime = hour * 60 + minute;

            if(currentTime >= startMinutes && (currentTime-15) <= endMinutes){
                timeConsumption = endMinutes - (currentTime-15);
            }

            if(currentTime >= startMinutes && currentTime <= endMinutes) {
                timeConsumption = currentTime - startMinutes;
            }

            if (timeConsumption > 15) {
                timeConsumption = 15;
            } else if (timeConsumption < 0) {
                timeConsumption = 0;
            }
            consumption += scheduleList[j].wattage / durationOfDevice * timeConsumption;
        }
        energyUsed.push(consumption);
        if (hour === 23 && minute === 45) {
            energyUsed.push(0);
            stop = true;
        }
        minute += 15;
        if (minute === 60) {
            hour++;
            minute = 0;
        }
    }
    return energyUsed;
}

function calculateEnergyProduced() {
    let energyProduced = [];
    let startHour = parseInt((window.solarData[0].watt_hours_period[0].timeForWattage.split(':')[0])) * 4;
    let startMinutes = parseInt(window.solarData[0].watt_hours_period[0].timeForWattage.split(':')[1]);
    let addingQuarters = parseInt(startMinutes / 15);
    let endHour = parseInt(window.solarData[0].watt_hours_period[window.solarData[0].watt_hours_period.length - 1].timeForWattage.split(':')[0]) * 4 + 1;
    let endMinutes = parseInt(window.solarData[0].watt_hours_period[window.solarData[0].watt_hours_period.length - 1].timeForWattage.split(':')[1]);
    let lastQuarters = parseInt(endMinutes / 15);

    for (let i = 0; i <= startHour; i++) {
        energyProduced.push(0);
    }
    let count = 0;
    for (let i = 1; i <= (endHour - startHour) / 4; i++) {
        if (i !== 0) {
            if (i === 1) {
                for (let j = 0; j < addingQuarters; j++) {
                    energyProduced.push(0);
                }
                for (let j = 0; j < 4 - addingQuarters; j++) {
                    energyProduced.push((window.solarData[0].watt_hours_period[i].wattage) / (4 - addingQuarters));
                }
            } else {
                energyProduced.push((window.solarData[0].watt_hours_period[i].wattage) / 4)
                if (count < 3) {
                    count++;
                    i--;
                } else {
                    count = 0;
                }
            }
        }
    }
    for (let i = 0; i < lastQuarters; i++) {
        energyProduced.push((window.solarData[0].watt_hours_period[window.solarData[0].watt_hours_period.length - 1].wattage) / lastQuarters);
        console.log("LastQuarters: " + lastQuarters);
    }
    for (let i = endHour + lastQuarters; i < 97; i++) {

        energyProduced.push(0);
    }
    return energyProduced;
}

export async function createEnergyComparison(allTimes, scheduleList) {
    let energyUsed = calculateEnergyUsed(allTimes, scheduleList);
    let energyProduced = calculateEnergyProduced();

    let xValues = ["00:00", "00:15", "00:30", "00:45",
        "01:00", "01:15", "01:30", "01:45",
        "02:00", "02:15", "02:30", "02:45",
        "03:00", "03:15", "03:30", "03:45",
        "04:00", "04:15", "04:30", "04:45",
        "05:00", "05:15", "05:30", "05:45",
        "06:00", "06:15", "06:30", "06:45",
        "07:00", "07:15", "07:30", "07:45",
        "08:00", "08:15", "08:30", "08:45",
        "09:00", "09:15", "09:30", "09:45",
        "10:00", "10:15", "10:30", "10:45",
        "11:00", "11:15", "11:30", "11:45",
        "12:00", "12:15", "12:30", "12:45",
        "13:00", "13:15", "13:30", "13:45",
        "14:00", "14:15", "14:30", "14:45",
        "15:00", "15:15", "15:30", "15:45",
        "16:00", "16:15", "16:30", "16:45",
        "17:00", "17:15", "17:30", "17:45",
        "18:00", "18:15", "18:30", "18:45",
        "19:00", "19:15", "19:30", "19:45",
        "20:00", "20:15", "20:30", "20:45",
        "21:00", "21:15", "21:30", "21:45",
        "22:00", "22:15", "22:30", "22:45",
        "23:00", "23:15", "23:30", "23:45",
        "00:00"
    ];

    new Chart("myChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: energyUsed,
                borderColor: "red",
                fill: false,
                label: "Energy Used"
            }, {
                data: energyProduced,
                borderColor: "green",
                fill: false,
                label: "Energy Produced",
            }]
        },
        options: {
            legend: {display: true},
        }
    });
}