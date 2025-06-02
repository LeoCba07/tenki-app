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

  // Optional: Load saved preferences
  const savedUnit = localStorage.getItem("unit");
  if (savedUnit === "imperial") unitToggle.checked = true;

  const isDark = localStorage.getItem("dark") === "true";
  darkToggle.checked = isDark;
  if (isDark) document.body.classList.add("dark-mode");
});
