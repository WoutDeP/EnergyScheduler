export async function getSolarData(latitude, longitude, declination, azimuth, kwph) {
    let mySolarData = await axios.get('http://homeassistant.local:3001/solarData', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });

    if (mySolarData.data.length > 0) {
        const date = new Date(mySolarData.data[0].id.split('-')[0], mySolarData.data[0].id.split('-')[1] - 1, mySolarData.data[0].id.split('-')[2]);
        if (date.toLocaleDateString() === new Date().toLocaleDateString()) {
            window.solarData = mySolarData.data;
            return mySolarData.data;
        } else {
            for (let i = 0; i < mySolarData.data.length; i++) {
                try {
                    await axios.delete(`http://homeassistant.local:3001/solarData/${mySolarData.data[i].id}`, {
                        headers: {
                            'Authorization':
                                `Bearer ${window.token}`
                        }
                    }).then(response => {
                    });
                } catch (errors) {
                    console.error(errors);
                    document.getElementById("error-alert").style.display = "block";
                    document.getElementById("error-alert").innerHTML += "Error getting solar data";
                }
            }
        }
    }
    let solarData;
    try {
        solarData = await axios.get('https://api.forecast.solar/estimate/' + latitude + '/' + longitude + '/' + declination + '/' + azimuth + '/' + kwph)
    } catch (errors) {
        console.error(errors);
        document.getElementById("error-alert").style.display = "block";
        document.getElementById("error-alert").innerHTML += "Error getting solar data: Please check user configurations";
    }
    const keys = Object.keys(solarData.data.result.watt_hours_period);
    const values = Object.values(solarData.data.result.watt_hours_period);

    const solarToday = [];
    const date = new Date();
    let day = date.getDate();
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].split(" ")[0].split("-")[2] == day) {
            let myDate;
            let dateTime = new Date();
            dateTime.setHours(keys[i].split(" ")[1].split(":")[0]);
            dateTime.setMinutes(keys[i].split(" ")[1].split(":")[1]);
            dateTime.setSeconds(keys[i].split(" ")[1].split(":")[2]);
            if(dateTime.toLocaleTimeString().includes("AM")){
                myDate = dateTime.toLocaleTimeString().split(" ")[0];
            } else if (dateTime.toLocaleTimeString().includes("PM") && dateTime.toLocaleTimeString().split(":")[0] === "12"){
                myDate = dateTime.toLocaleTimeString().split(" ")[0];
            } else if(dateTime.toLocaleTimeString().includes("PM")){
                let dateHours = dateTime.getHours();
                let dateMinutes = dateTime.getMinutes();
                let dateSeconds = dateTime.getSeconds();
                myDate = dateHours + ":" + dateMinutes + ":" + dateSeconds;
            } else {
                myDate = dateTime.toLocaleTimeString();
            }
            solarToday.push({
                timeForWattage: myDate,
                wattage: values[i]
            });
        }
    }
    await postSolarData(solarToday);
    mySolarData = await axios.get('http://homeassistant.local:3001/solarData', {
        headers: {
            'Authorization':
                `Bearer ${window.token}`
        }
    });
    window.solarData = mySolarData.data;
}

async function postSolarData(solarData) {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let currentDate = `${year}-${month}-${day}`;
    try {
        await axios.post(`http://homeassistant.local:3001/solarData`, {
            id: currentDate,
            watt_hours_period: solarData
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
        document.getElementById("error-alert").innerHTML += "Error posting solar data";
    }
}

