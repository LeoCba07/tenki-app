import { API_KEY } from './config.js';

const city = "Tokyo";
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));
  
document.addEventListener("DOMContentLoaded", () => {
  const darkToggle = document.getElementById("darkmode-checkbox");
  const unitToggle = document.getElementById("unit-checkbox");

  // Dark Mode Logic
  darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkToggle.checked);
  });

  // Unit Toggle Logic
  unitToggle.addEventListener("change", () => {
    const isMetric = !unitToggle.checked;
    // Save to localStorage
    localStorage.setItem("unit", isMetric ? "metric" : "imperial");
    alert(`Switched to ${isMetric ? "Celsius (°C)" : "Fahrenheit (°F)"}`);
  });

  // Load saved preferences
  const savedUnit = localStorage.getItem("unit");
  if (savedUnit === "imperial") unitToggle.checked = true;

  const isDark = localStorage.getItem("dark") === "true";
  darkToggle.checked = isDark;
  if (isDark) document.body.classList.add("dark-mode");
});

// var citySearch = document.getElementById("city-input");
// var searchBtn = document.getElementById("search-btn");

