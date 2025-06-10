import { API_KEY } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const searchContainer = document.getElementById("search-container");
  const searchInput = document.getElementById("city-input");
  const searchBtn = document.getElementById("search-btn");
  const forecastView = document.getElementById("forecast-view");
  const forecastCards = document.querySelectorAll(".forecast-card");
  const navbarPlaceholder = document.getElementById("navbar-search-placeholder");
  
  const darkToggle = document.getElementById("darkmode-checkbox");
  const unitToggle = document.getElementById("unit-checkbox");

  // CHANGE 1: Instead of localStorage, we use regular variables
  // These will reset when you refresh the page, but work everywhere
  let isDarkMode = false;
  let currentUnit = "metric"; // "metric" for Celsius, "imperial" for Fahrenheit

  // Initialize UI based on our default preferences
  initPreferences();

  // Event listeners
  searchBtn.addEventListener("click", onSearch);
  searchInput.addEventListener("keydown", onKeyDown); // NEW: Listen for key presses
  darkToggle.addEventListener("change", onDarkToggle);
  unitToggle.addEventListener("change", onUnitToggle);

  function onSearch() {
    const city = searchInput.value.trim();
    
    // IMPROVEMENT: Better input validation
    if (!city) {
      alert("Please enter a city name.");
      return;
    }
    
    if (city.length < 2) {
      alert("City name must be at least 2 characters long.");
      return;
    }
    
    if (city.length > 50) {
      alert("City name is too long. Please enter a shorter name.");
      return;
    }

    fetchWeather(city);
  }

  // NEW FUNCTION: Handle keyboard input
  function onKeyDown(event) {
    // Check if the pressed key is Enter (key code 13 or key name "Enter")
    if (event.key === "Enter") {
      onSearch(); // Call the same search function as the button
    }
  }

  async function fetchWeather(city) {
    try {
      // We need to make TWO API calls:
      // 1. Current weather (different endpoint)
      // 2. 5-day forecast (existing)
      
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;

      // Fetch both at the same time for better performance
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl)
      ]);
      
      // Check if both requests succeeded
      if (currentResponse.status === 404 || forecastResponse.status === 404) {
        throw new Error("City not found. Please check the spelling and try again.");
      } else if (currentResponse.status === 401 || forecastResponse.status === 401) {
        throw new Error("API key issue. Please check your API configuration.");
      } else if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error("Weather service is temporarily unavailable. Please try again later.");
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      
      renderCurrentWeather(currentData);
      renderForecast(forecastData);
      moveSearchToNavbar();

      // Hide the home title after search
      const homeView = document.getElementById("home-view");
        if (homeView) {
          homeView.style.display = "none";
        }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  // NEW FUNCTION: Display current weather
  function renderCurrentWeather(data) {
    // Get all the elements we need to update
    const cityNameElem = document.getElementById("city-name");
    const countryNameElem = document.getElementById("country-name");
    const currentTimeElem = document.getElementById("current-time");
    const currentIcon = document.getElementById("current-weather-icon");
    const currentTemp = document.getElementById("current-temperature");
    const currentDesc = document.getElementById("current-description");
    const feelsLike = document.getElementById("feels-like");
    const humidity = document.getElementById("humidity");
    const windSpeed = document.getElementById("wind-speed");
    const pressure = document.getElementById("pressure");

    // Fill in the basic city info
    cityNameElem.textContent = data.name;
    countryNameElem.textContent = data.sys.country;

    const now = new Date();
    currentTimeElem.textContent = now.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Fill in current weather details
    const temp = Math.round(data.main.temp);
    const unitSymbol = currentUnit === "imperial" ? "°F" : "°C";
    
    currentIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    currentIcon.alt = data.weather[0].description;
    currentTemp.textContent = `${temp}${unitSymbol}`;
    currentDesc.textContent = data.weather[0].description;
    
    feelsLike.textContent = `${Math.round(data.main.feels_like)}${unitSymbol}`;
    humidity.textContent = `${data.main.humidity}%`;
    
    // Convert wind speed based on unit
    const windSpeedValue = currentUnit === "imperial" 
      ? `${Math.round(data.wind.speed)} mph`
      : `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    windSpeed.textContent = windSpeedValue;
    
    pressure.textContent = `${data.main.pressure} hPa`;
  }

  function renderForecast(data) {
    // Filter for forecasts at 12:00:00 each day
    const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach((forecast, i) => {
      if (i >= forecastCards.length) return;
      const card = forecastCards[i];
      const date = new Date(forecast.dt_txt);
      const fullDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      });
      const temp = Math.round(forecast.main.temp);
      const icon = forecast.weather[0].icon;
      const description = forecast.weather[0].description;

      card.innerHTML = `
        <h4>${fullDate}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
        <p>${temp}°${currentUnit === "imperial" ? "F" : "C"}</p>
        <p>${description}</p>
      `;
      card.dataset.details = JSON.stringify(forecast);
    });

    forecastView.classList.remove("hidden");
  }

  function moveSearchToNavbar() {
    if (!navbarPlaceholder.contains(searchContainer)) {
      searchContainer.classList.remove("centered-search");
      searchContainer.classList.add("navbar-search");
      navbarPlaceholder.appendChild(searchContainer);
    }
  }

  function onDarkToggle() {
    // CHANGE 3: Update our variable instead of localStorage
    isDarkMode = darkToggle.checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
  }

  function onUnitToggle() {
    const isImperial = unitToggle.checked;
    // CHANGE 4: Update our variable instead of localStorage
    currentUnit = isImperial ? "imperial" : "metric";
    alert(`Switched to ${isImperial ? "Fahrenheit (°F)" : "Celsius (°C)"}`);
  }

  function initPreferences() {
    // CHANGE 5: Use our default values instead of localStorage
    darkToggle.checked = isDarkMode;
    if (isDarkMode) document.body.classList.add("dark-mode");

    unitToggle.checked = currentUnit === "imperial";
  }
});