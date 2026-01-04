const API_KEY = 'e638990d12205b027782fe54b273de84';

async function getWeather() {
    const city = document.getElementById('city').value.trim();
    const province = document.getElementById('province').value.trim();
    const country = document.getElementById('country').value.trim();
    const latInput = document.getElementById('lat').value.trim();
    const lonInput = document.getElementById('lon').value.trim();
    const excludePart = document.getElementById('excludeSelect').value;
    const weatherResult = document.getElementById('weatherResult');

    if (!city || !country) {
        weatherResult.innerHTML = '<div class="error">⚠️ Please enter at least a city and country code.</div>';
        return;
    }

    weatherResult.innerHTML = '<div class="loading">🔄 Fetching weather data...</div>';

    let locationQuery = city;
    if (province) locationQuery += `,${province}`;
    locationQuery += `,${country}`;

    const showCurrent = !excludePart.includes('current');
    const showDaily = !excludePart.includes('daily');


    try {
        let html = '';

        if (showCurrent) {
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(locationQuery)}&units=metric&appid=${API_KEY}`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) throw new Error(`Unable to fetch forecast (Error ${forecastResponse.status})`);
            const forecastData = await forecastResponse.json();


            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationQuery)}&units=metric&appid=${API_KEY}`;
            const currentResponse = await fetch(currentUrl);
            if (!currentResponse.ok) throw new Error(`Unable to fetch weather (Error ${currentResponse.status})`);
            const currentData = await currentResponse.json();
            console.log('Open Weather Map Data(Weather): ', currentData);

            const sunriseTime = new Date(currentData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sunsetTime = new Date(currentData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            html += `
        <div class="weather-item">
            <strong>☀️ Current Weather - ${currentData.name}</strong><br>
            Longitude: ${currentData.coord.lon}<br>
            Latitude: ${currentData.coord.lat}<br>
            Population: ${forecastData.city.population}<br>    
            🌡️ Temperature: ${currentData.main.temp.toFixed(1)}°C (feels like ${currentData.main.feels_like.toFixed(1)}°C)<br>
            Main: ${currentData.weather[0].main}<br>
            Description: ${currentData.weather[0].description.charAt(0).toUpperCase() + currentData.weather[0].description.slice(1)}<br>
            🌅 Sunrise: ${sunriseTime}<br>
            🌇 Sunset: ${sunsetTime}<br>
            💧 Humidity: ${currentData.main.humidity}%<br>
            Pressure: ${currentData.main.pressure} hPa<br>
            Sea Level: ${currentData.main.sea_level || 'N/A'}<br>
            💨 Wind Speed: ${currentData.wind.speed.toFixed(1)} m/s
        </div>
    `;
        }


        if (showDaily) {
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(locationQuery)}&units=metric&appid=${API_KEY}`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) throw new Error(`Unable to fetch forecast (Error ${forecastResponse.status})`);

            const forecastData = await forecastResponse.json();
            console.log('Open Weather Map Data(Forecast):', forecastData);
            const dailyForecasts = {};

            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dateKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const hour = date.getHours();

                if (!dailyForecasts[dateKey] || Math.abs(hour - 12) < Math.abs(dailyForecasts[dateKey].hour - 12)) {
                    dailyForecasts[dateKey] = {
                        temp: item.main.temp,
                        tempMin: item.main.temp_min,
                        tempMax: item.main.temp_max,
                        desc: item.weather[0].description,
                        hour
                    };
                }
            });

            html += '<div class="weather-item"><strong>📅 5-Day Forecast</strong></div>';
            Object.entries(dailyForecasts).forEach(([date, data]) => {
                html += `
                    <div class="weather-item">
                        <strong>${date}</strong><br>
                        🌡️ ${data.temp.toFixed(1)}°C (${data.tempMin.toFixed(1)}°C - ${data.tempMax.toFixed(1)}°C)<br>
                        ${data.desc.charAt(0).toUpperCase() + data.desc.slice(1)}
                    </div>
                `;
            });
        }

        weatherResult.innerHTML = html || '<div class="error">No data available.</div>';
    } catch (error) {
        console.error(error);
        weatherResult.innerHTML = `<div class="error">❌ ${error.message}</div>`;
    }
}
