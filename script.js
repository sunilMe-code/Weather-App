const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

async function getCoordinates(city) {

    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        alert("City not found");
        return null;
    }

    return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
        city: data.results[0].name,
        country: data.results[0].country
    };
};

let hourlyData = null;

const fetchingWeather = async (latitude, longitude) => {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,is_day&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,precipitation_probability,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`
    );

    const data = await response.json();

    const current = data.current
    const hourly = data.hourly;
    const daily = data.daily;
    hourlyData = hourly;


    getTodayWeather(current);
    getHourlyWeather(hourlyData);

    getSevenDayForecast(daily);
}




window.addEventListener("load", () => {
    fetchingWeather(28.6139, 77.2090);   // Delhi
});





searchBtn.addEventListener("click", async () => {

    const city = searchInput.value.trim();

    if (!city) return;

    const location = await getCoordinates(city);

    if (!location) return;

    document.getElementById("country").textContent = `${location.country}`;
    document.getElementById("city").textContent = `${location.city}`;

    fetchingWeather(location.latitude, location.longitude);

});

searchInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        searchBtn.click();
    }

});

function getWeatherInfo(code) {
    switch (code) {
        case 0:
            return {
                name: "Clear Sky",
                icon: "icons/sunny.svg"
            };

        case 1:
        case 2:
            return {
                name: "Partly Cloudy",
                icon: "icons/partly-cloudy.svg"
            };

        case 3:
            return {
                name: "Cloudy",
                icon: "icons/cloudy.svg"
            };

        case 45:
        case 48:
            return {
                name: "Fog",
                icon: "icons/fog.svg"
            };

        case 51:
        case 53:
        case 55:
            return {
                name: "Drizzle",
                icon: "icons/drizzle.svg"
            };

        case 61:
        case 63:
        case 65:
            return {
                name: "Rain",
                icon: "icons/rain.svg"
            };

        case 71:
        case 73:
        case 75:
            return {
                name: "Snow",
                icon: "icons/snow.svg"
            };

        case 95:
            return {
                name: "Thunderstorm",
                icon: "icons/thunder.svg"
            };

        default:
            return {
                name: "Clear Sky",
                icon: "icons/sunny.svg"
            };
    }
};

const sunAnimation = document.getElementById("sunAnimation");
const stormAnimation = document.getElementById("stormAnimation");

function updateWeatherAnimation(weatherCode) {


    sunAnimation.classList.remove("active");
    stormAnimation.classList.remove("active");

    // Clear, mainly clear, partly cloudy
    if ([0, 1, 2, 3].includes(weatherCode)) {
        sunAnimation.classList.add("active");
    }

    // Drizzle, rain, snow, thunderstorm
    else if (
        [51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82, 95, 96, 99]
            .includes(weatherCode)
    ) {
        stormAnimation.classList.add("active");
    }
};

let todayWeather = document.querySelector(".today-weather-content")

const getTodayWeather = (current) => {
    const weather = getWeatherInfo(current.weather_code);
    updateWeatherAnimation(current.weather_code);
    todayWeather.innerHTML = "";
    todayWeather.innerHTML += `  

            <div class="weather-content1">

                <div class="today-weather-details">
                    <div class="temprature">
                        <h1>${Math.floor(current.temperature_2m)}&degC</h1>
                    </div>
                    <span>${weather.name}</span>
                    <p>Feels like ${Math.floor(current.apparent_temperature)}&deg</p>
                </div>

                <div class="weather-img">
                    <img src="${weather.icon}" alt="">
                </div>

            </div>

            <div class="weather-content2">
                <div class="humidity"><img src="icons/humidity.svg" alt="">${current.relative_humidity_2m}%</div>
                <div class="wind"><img src="icons/wind.svg" alt="">${current.wind_speed_10m
        }km/h</div>
                <div class="uv"><img src="icons/cloud.svg" alt="">${current.cloud_cover
        }%</div>
            </div>
`
}

const hourlyWeather = document.querySelector(".hourlyWeather");

const getHourlyWeather = (hourly) => {

    hourlyWeather.innerHTML = "";

    const now = new Date();
    const startIndex = hourly.time.findIndex(time => {
        return new Date(time) >= now;
    })

    for (let i = startIndex; i < startIndex + 7; i++) {
        const weather = getWeatherInfo(hourly.weather_code[i]);
        hourlyWeather.innerHTML += `
    <li>
      <div class="time">
        <span> ${formatTime(hourly.time[i])}</span>
      </div>

      <div class="weather-icon">
        <img src="${weather.icon}" alt="">
      </div>

      <div class="temperature">
        <h3>${Math.floor(hourly.temperature_2m[i])}&deg;</h3>
      </div>
    </li>
  `;
    }

};



function formatTime(dateTime) {
    const date = new Date(dateTime);

    // Mobile
    if (window.innerWidth <= 768) {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true
        });
    }

    // Desktop
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}





const forecastList = document.getElementById("forecastList");

const getSevenDayForecast = (daily) => {

    const weekMin = Math.min(...daily.temperature_2m_min);
    const weekMax = Math.max(...daily.temperature_2m_max);

    forecastList.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {
        const weather = getWeatherInfo(daily.weather_code[i]);
        const min = daily.temperature_2m_min[i];
        const max = daily.temperature_2m_max[i];

        const left = ((min - weekMin) / (weekMax - weekMin)) * 100;
        const width = ((max - min) / (weekMax - weekMin)) * 100;

        forecastList.innerHTML += ` <li>
                    <div class="day"><span>${getDay(daily.time[i])}</span></div>
                    <div class="weather-type"><div class="weather-icon"><img src="${weather.icon}" alt=""></div><span>${weather.name}</span></div>
                    <div class="average-temprature">
                        <div class="minimum-temprature">${Math.floor(min)}&deg</div>
                         <div class="temprature-bar">
                            <div class="temprature-fill" style="
                                      left:${left}%;
                                      width:${width}%;">
                              </div>
                        </div>
                        <div class="maximum-temprature">${Math.floor(max)}&deg</div>
                    </div>
                </li>
        `;
    }
};

function getDay(date) {

    return new Date(date).toLocaleDateString("en-US", {
        weekday: "short"
    });

}


const raining = () => {
    let field = document.getElementById('rainfield');
    let count = 80;

    for (let i = 0; i < count; i++) {
        let drop = document.createElement('div');
        drop.className = 'drop';

        let left = Math.random() * 100;
        let duration = 0.5 + Math.random() * 0.5;
        let delay = Math.random() * 2;
        let height = 10 + Math.random() * 10;
        let opacity = 0.4 + Math.random() * 0.5;

        drop.style.left = left + '%';
        drop.style.animationDuration = duration + 's';
        drop.style.animationDelay = delay + 's';
        drop.style.height = height + 'px';
        drop.style.opacity = opacity.toString();

        field.appendChild(drop);
    }
};

raining();

window.addEventListener("resize", () => {

    if (hourlyData) {
        getHourlyWeather(hourlyData);
    }

});