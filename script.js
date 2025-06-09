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

  // Initialize UI based on saved preferences
  initPreferences();

  // Event listeners
  searchBtn.addEventListener("click", onSearch);
  darkToggle.addEventListener("change", onDarkToggle);
  unitToggle.addEventListener("change", onUnitToggle);

  function onSearch() {
    const city = searchInput.value.trim();
    if (!city) return;

    fetchWeather(city);
  }

  async function fetchWeather(city) {
    try {
      // Use the selected unit from localStorage or default to metric
      const unit = localStorage.getItem("unit") || "metric";
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("City not found or API error");

      const data = await response.json();
      renderForecast(data);
      moveSearchToNavbar();

      // Hide the home title after search
      const homeView = document.getElementById("home-view");
        if (homeView) {
          homeView.style.display = "none";
        }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch weather data. Please check the city name and try again.");
    }
  }

  function renderForecast(data) {
    // Fill city info
  const cityNameElem = document.getElementById("city-name");
  const countryNameElem = document.getElementById("country-name");
  const currentTimeElem = document.getElementById("current-time");

  cityNameElem.textContent = data.city.name;
  countryNameElem.textContent = data.city.country;

  const now = new Date();
  
  currentTimeElem.textContent = now.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
        <p>${temp}°${localStorage.getItem("unit") === "imperial" ? "F" : "C"}</p>
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
    document.body.classList.toggle("dark-mode", darkToggle.checked);
    localStorage.setItem("dark", darkToggle.checked);
  }

  function onUnitToggle() {
    const isImperial = unitToggle.checked;
    const unit = isImperial ? "imperial" : "metric";
    localStorage.setItem("unit", unit);
    alert(`Switched to ${isImperial ? "Fahrenheit (°F)" : "Celsius (°C)"}`);
  }

  function initPreferences() {
    // Dark mode
    const savedDark = localStorage.getItem("dark") === "true";
    darkToggle.checked = savedDark;
    if (savedDark) document.body.classList.add("dark-mode");

    // Unit
    const savedUnit = localStorage.getItem("unit") || "metric";
    unitToggle.checked = savedUnit === "imperial";
  }
});
