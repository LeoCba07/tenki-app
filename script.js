import { API_KEY } from './config.js';

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", () => {
  // === DOM ELEMENTS ===
  const searchContainer = document.getElementById("search-container");
  const searchInput = document.getElementById("city-input");
  const searchBtn = document.getElementById("search-btn");
  const searchIcon = document.querySelector(".search-icon");
  const locationBtn = document.getElementById("location-btn");

  const navbarPlaceholder = document.getElementById("navbar-search-placeholder");
  const unitToggle = document.getElementById("unit-toggle");
  const darkToggle = document.getElementById("dark-mode-toggle");

  const forecastView = document.getElementById("forecast-view");
  const hourlyForecast = document.getElementById("hourly-forecast");
  const forecastGrid = document.getElementById("forecast-grid");

  const cityNameEl = document.getElementById("city-name");
  const countryFlagEl = document.getElementById("country-flag");
  const countryNameEl = document.getElementById("country-name");
  const capitalLink = document.getElementById("capital-link");
  const currentTimeEl = document.getElementById("current-time");

  const currentWeatherIcon = document.getElementById("current-weather-icon");
  const currentTemp = document.getElementById("current-temperature");
  const currentDesc = document.getElementById("current-description");

  const feelsLikeEl = document.getElementById("feels-like");
  const humidityEl = document.getElementById("humidity");
  const windSpeedEl = document.getElementById("wind-speed");

  // === APP STATE ===
  let isDarkMode = false;
  let unitSystem = "metric"; // "metric" or "imperial"
  let currentCity = "";

  // ============ EVENT LISTENERS ============
  searchBtn.addEventListener("click", handleSearch);
  searchIcon.addEventListener("click", handleSearch);
  searchInput.addEventListener("keydown", (e) => e.key === "Enter" && handleSearch());
  locationBtn.addEventListener("click", handleGeolocation);
  unitToggle.addEventListener("change", handleUnitToggle);
  darkToggle.addEventListener("change", handleDarkToggle);

  // === INIT ===
  applyInitialPreferences();

  // ============ HANDLERS ============
  function handleSearch() {
    const city = searchInput.value.trim();
    if (city.length < 2) return alert("Enter a valid city name.");
    fetchWeather(city);
  }

  function handleGeolocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchWeatherByCoords(coords.latitude, coords.longitude),
      () => alert("Failed to retrieve location.")
    );
  }

  function handleUnitToggle() {
    const newUnit = unitToggle.checked ? "imperial" : "metric";
    if (newUnit === unitSystem || !currentCity) return;
    unitSystem = newUnit;
    fetchWeather(currentCity);
  }

  function handleDarkToggle() {
    isDarkMode = darkToggle.checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
  }

  function applyInitialPreferences() {
    darkToggle.checked = isDarkMode;
    unitToggle.checked = unitSystem === "imperial";
    document.body.classList.toggle("dark-mode", isDarkMode);
  }

  // ============ FETCH FUNCTIONS ============
  async function fetchWeather(city) {
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unitSystem}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unitSystem}`)
      ]);

      if (!currentRes.ok || !forecastRes.ok) throw new Error("Weather data fetch failed.");
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      currentCity = currentData.name;
      renderCurrentWeather(currentData);
      renderForecast(forecastData);
      fetchCountryDetails(currentData.sys.country);

      moveSearchToNavbar();
    } catch (err) {
      alert(err.message);
    }
  }

  async function fetchWeatherByCoords(lat, lon) {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unitSystem}`);
      const data = await res.json();
      fetchWeather(data.name);
    } catch {
      alert("Could not retrieve weather by location.");
    }
  }

  async function fetchCountryDetails(code) {
    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
      const [data] = await res.json();
      countryFlagEl.textContent = data.flag;
      countryNameEl.textContent = data.name.common;
      capitalLink.textContent = data.capital?.[0] || "";
    } catch {
      countryFlagEl.textContent = "🏳️";
      countryNameEl.textContent = "Unknown";
      capitalLink.textContent = "";
    }
  }

  // ============ RENDERING ============
  function renderCurrentWeather(data) {
    const timezoneOffset = data.timezone * 1000;
    const localTime = new Date(Date.now() + timezoneOffset - new Date().getTimezoneOffset() * 60000);

    cityNameEl.textContent = data.name;
    currentTimeEl.textContent = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const symbol = unitSystem === "imperial" ? "°F" : "°C";

    currentWeatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    currentTemp.textContent = `${Math.round(data.main.temp)}${symbol}`;
    currentDesc.textContent = data.weather[0].description;

    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}${symbol}`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${Math.round(data.wind.speed)} ${unitSystem === 'imperial' ? 'mph' : 'm/s'}`;
  }

  function renderForecast(data) {
    const dailyData = {};
    data.list.forEach(entry => {
      const date = new Date(entry.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) dailyData[date] = [];
      dailyData[date].push(entry);
    });

    const days = Object.entries(dailyData);

    // Render today's hourly breakdown
    hourlyForecast.innerHTML = days[0][1].map(entry => `
      <div class="hourly-item">
        <div class="hourly-time">${new Date(entry.dt * 1000).getHours()}:00</div>
        <img class="hourly-icon" src="https://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="${entry.weather[0].description}" />
        <div class="hourly-temp">${Math.round(entry.main.temp)}°</div>
      </div>
    `).join("");

    // Render next 4 day summaries
    forecastGrid.innerHTML = days.slice(1, 5).map(([date, entries]) => {
      const noonEntry = entries.find(e => new Date(e.dt * 1000).getHours() >= 12) || entries[0];
      return `
        <div class="forecast-card">
          <h4>${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</h4>
          <img src="https://openweathermap.org/img/wn/${noonEntry.weather[0].icon}.png" alt="${noonEntry.weather[0].description}" />
          <div class="forecast-temp">${Math.round(noonEntry.main.temp)}°${unitSystem === 'imperial' ? 'F' : 'C'}</div>
          <div class="forecast-desc">${noonEntry.weather[0].description}</div>
        </div>
      `;
    }).join("");

    forecastView.classList.remove("hidden");
  }

  function moveSearchToNavbar() {
    if (!navbarPlaceholder.contains(searchContainer)) {
      searchContainer.classList.remove("centered");
      navbarPlaceholder.appendChild(searchContainer);
      document.getElementById("home-view").style.display = "none";
    }
  }
});