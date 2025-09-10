# 🌤️ Tenki Weather App

My first personal project! A weather website that shows current conditions and forecasts for cities around the world.

## ✨ What it does

- **Current weather** - temperature, humidity, wind speed, etc.
- **4-day forecast** - see what's coming up
- **Hourly breakdown** - today's weather by hour
- **Location detection** - use your current location or search manually
- **Dark mode** - because why not
- **Unit switching** - toggle between °C/°F and metric/imperial

## 🚀 How to run it

1. **Clone the repo**
   ```bash
   git clone https://github.com/LeoCba07/tenki-app.git
   ```

2. **Get an API key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api) (free tier works fine)
   - Create `config.js` file:
   ```javascript
   export const API_KEY = 'your-api-key-here';
   ```

3. **Open `index.html`** in your browser

## 🛠️ Built with

- **HTML/CSS/JavaScript** - vanilla, no frameworks
- **OpenWeatherMap API** - for weather data
- **REST Countries API** - for country flags and info

## 🎯 What I learned

This was my first time working with:
- APIs and handling JSON responses
- JavaScript modules and async/await
- CSS animations and responsive design
- Managing API keys properly

I definitely used AI assistance for parts of this, especially the styling and some of the API integration logic. Still learning but pretty happy with how it turned out!

## 🐛 Issues I ran into

- Figuring out how to structure the JavaScript properly
- Getting the search functionality to work smoothly
- Making responsive design actually work on mobile
- Understanding the OpenWeatherMap API documentation
- Handling errors when cities aren't found

## 🔧 Future improvements

- Better error messages
- Save favorite cities
- Weather alerts
- More detailed forecasts
- Maybe add weather maps

## 📁 Project structure

```
tenki-app/
├── index.html
├── style.css  
├── script.js
├── config.js (you create this)
└── README.md
```

---

**Note:** This is definitely an MVP with lots of room for improvement, but it works and I learned a ton building it!
