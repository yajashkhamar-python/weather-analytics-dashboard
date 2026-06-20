let tempChart;
let humidityChart;
let rainChart;

let searchHistory =
JSON.parse(
localStorage.getItem("weatherHistory")
) || [];

window.onload = function()
{
    renderHistory();
};

function renderHistory()
{
    let historyHTML =
    "<h3>Recent Searches</h3>";

    searchHistory.forEach(cityName =>
    {
        historyHTML +=
        `
        <span class="history-item">
            ${cityName}
        </span>
        `;
    });

    document.getElementById("history").innerHTML =
    historyHTML;
}

async function getWeather()
{
    document.getElementById("loading").style.display =
    "block";

    document.getElementById("downloadBtn").style.display =
    "none";

    let city =
    document.getElementById("city").value;

    if(city === "")
    {
        alert("Enter City Name");
        document.getElementById("loading").style.display =
        "none";
        return;
    }

    if(!searchHistory.includes(city))
    {
        searchHistory.unshift(city);

        if(searchHistory.length > 5)
        {
            searchHistory.pop();
        }

        localStorage.setItem(
            "weatherHistory",
            JSON.stringify(searchHistory)
        );

        renderHistory();
    }

    let geoUrl =
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

    let geoResponse =
    await fetch(geoUrl);

    let geoData =
    await geoResponse.json();

    if(!geoData.results)
    {
        alert("City not found");

        document.getElementById("loading").style.display =
        "none";

        return;
    }

    let latitude =
    geoData.results[0].latitude;

    let longitude =
    geoData.results[0].longitude;

    let weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_sum`;

    let weatherResponse =
    await fetch(weatherUrl);

    let weatherData =
    await weatherResponse.json();

    document.getElementById("loading").style.display =
    "none";

    document.getElementById("downloadBtn").style.display =
    "inline-block";

    let temperature =
    weatherData.current.temperature_2m;

    let humidity =
    weatherData.current.relative_humidity_2m;

    let rain =
    weatherData.current.rain;

    let windspeed =
    weatherData.current.wind_speed_10m;

    window.reportData = {
        city,
        temperature,
        humidity,
        rain,
        windspeed
    };

    let dates =
    weatherData.daily.time;

    let maxTemps =
    weatherData.daily.temperature_2m_max;

    let minTemps =
    weatherData.daily.temperature_2m_min;

    let humidityData =
    weatherData.daily.relative_humidity_2m_mean;

    let rainData =
    weatherData.daily.precipitation_sum;

    let hottestDay =
    dates[maxTemps.indexOf(
    Math.max(...maxTemps)
    )];

    let coolestDay =
    dates[minTemps.indexOf(
    Math.min(...minTemps)
    )];

    let rainiestDay =
    dates[rainData.indexOf(
    Math.max(...rainData)
    )];

    let averageTemp =
    (
        maxTemps.reduce((a,b)=>a+b,0)
        /
        maxTemps.length
    ).toFixed(1);

    let temperatureRange =
    (
        Math.max(...maxTemps)
        -
        Math.min(...minTemps)
    ).toFixed(1);

    let forecastHTML =
    `<div class="forecast-container">`;

    for(let i=0;i<dates.length;i++)
    {
        forecastHTML +=
        `
        <div class="forecast-card">
            <h4>${dates[i]}</h4>
            <p>🔺 ${maxTemps[i]} °C</p>
            <p>🔻 ${minTemps[i]} °C</p>
            <p>💧 ${humidityData[i]}%</p>
            <p>☔ ${rainData[i]} mm</p>
        </div>
        `;
    }

    forecastHTML += "</div>";

    document.getElementById("weather").innerHTML =
    `
    <h2>${city}</h2>

    <div class="stats-container">

        <div class="stat-card">
            <div class="icon">🌡</div>
            <h2>${temperature}°C</h2>
            <p>Temperature</p>
        </div>

        <div class="stat-card">
            <div class="icon">💧</div>
            <h2>${humidity}%</h2>
            <p>Humidity</p>
        </div>

        <div class="stat-card">
            <div class="icon">☔</div>
            <h2>${rain} mm</h2>
            <p>Rain</p>
        </div>

        <div class="stat-card">
            <div class="icon">💨</div>
            <h2>${windspeed}</h2>
            <p>Wind Speed</p>
        </div>

    </div>

    <div class="card">

        <h2>📊 Weather Insights</h2>

        <p>🔥 Hottest Day : ${hottestDay}</p>

        <p>❄ Coolest Day : ${coolestDay}</p>

        <p>🌧 Rainiest Day : ${rainiestDay}</p>

        <p>🌡 Temperature Range : ${temperatureRange} °C</p>

        <p>📈 Average Max Temp : ${averageTemp} °C</p>

    </div>

    <h2>7 Day Forecast</h2>

    ${forecastHTML}
    `;

    if(tempChart) tempChart.destroy();
    if(humidityChart) humidityChart.destroy();
    if(rainChart) rainChart.destroy();

    tempChart = new Chart(
        document.getElementById("tempChart"),
        {
            type:'line',
            data:{
                labels:dates,
                datasets:[
                    {
                        label:'Max Temp',
                        data:maxTemps
                    },
                    {
                        label:'Min Temp',
                        data:minTemps
                    }
                ]
            }
        }
    );

    humidityChart = new Chart(
        document.getElementById("humidityChart"),
        {
            type:'bar',
            data:{
                labels:dates,
                datasets:[
                    {
                        label:'Humidity',
                        data:humidityData
                    }
                ]
            }
        }
    );

    rainChart = new Chart(
        document.getElementById("rainChart"),
        {
            type:'bar',
            data:{
                labels:dates,
                datasets:[
                    {
                        label:'Rainfall',
                        data:rainData
                    }
                ]
            }
        }
    );
}

function toggleTheme()
{
    document.body.classList.toggle(
    "light-mode");
}

function getCurrentLocationWeather()
{
    navigator.geolocation.getCurrentPosition(
        async function(position)
        {
            let latitude =
            position.coords.latitude;

            let longitude =
            position.coords.longitude;

            let geoURL =
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`;

            let response =
            await fetch(geoURL);

            let data =
            await response.json();

            if(data.results &&
               data.results.length > 0)
            {
                document.getElementById("city").value =
                data.results[0].name;

                getWeather();
            }
        }
    );
}

function downloadReport()
{
    let report =
`Weather Analytics Report

City: ${reportData.city}

Temperature: ${reportData.temperature} °C

Humidity: ${reportData.humidity} %

Rain: ${reportData.rain} mm

Wind Speed: ${reportData.windspeed} km/h`;

    let blob =
    new Blob([report],
    {type:"text/plain"});

    let link =
    document.createElement("a");

    link.href =
    URL.createObjectURL(blob);

    link.download =
    `${reportData.city}_Weather_Report.txt`;

    link.click();
}