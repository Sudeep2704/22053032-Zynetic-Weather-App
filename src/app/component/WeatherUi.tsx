"use client";
import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Sun, RefreshCw, Moon, Search, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { fetchWeatherData } from "../Service/WeatherService";

const WeatherApp = () => {
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState("Delhi");
  const [query, setQuery] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const fetchWeather = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { weatherJson, forecastJson } = await fetchWeatherData(city);
      setWeatherData(weatherJson);
      const dailyForecast = forecastJson.list.filter((item, index) => index % 8 === 0);
      setForecastData(dailyForecast);
    } catch (err) {
      setError("City not found or API error.");
      setWeatherData(null);
      setForecastData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [city]);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setCity(trimmed);
    setQuery("");

    const updatedSearches = [trimmed, ...recentSearches.filter((item) => item !== trimmed)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const bgClasses =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray"
      : "bg-gradient-to-br from-blue-200 via-blue-100 to-white text-gray-900";

  const cardBg =
    theme === "dark"
      ? "bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-white"
      : "bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl";

  

  const InlineLoader = () => (
    <div className="flex items-center justify-center py-8">
      <motion.div
        className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>



  );


  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${bgClasses}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 60 }}
        >
          <h1 className={`text-4xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Weather App</h1>
          <Button onClick={toggleTheme} variant="ghost" className="transition-transform hover:scale-110">
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </motion.div>

        {/* Search Bar with input */}
        <motion.div
          className="flex gap-2 items-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Input
            placeholder="Enter city name..."
            className="flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button onClick={handleSearch} className="transition-all duration-300 hover:shadow-lg">
              <Search className="mr-2" />
              Search
            </Button>
          </motion.div>
        </motion.div>

        {/* Recent Searches log upto 5 recent searches stored in local host */}
        {recentSearches.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Recent Searches
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-red-500 hover:text-red-700"
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem("recentSearches");
                }}
              >
                Clear
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCity(item);
                  }}
                >
                  {item}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error display and handling */}
        {error && <div className="text-red-500 text-center text-sm mb-4">{error}</div>}

        {/* Lazy loader for search input / redirects to error when failed api call */}
        {isLoading && weatherData && <InlineLoader />}

        {/* Weather display card */}
        {!isLoading && weatherData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`mb-6 transition-all duration-300 ${cardBg}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{weatherData.name}</h2>
                  <motion.div whileTap={{ rotate: 90 }}>
                    <Button variant="ghost" onClick={fetchWeather}>
                      <RefreshCw className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <motion.p
                      className="text-4xl font-bold"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      {Math.round(weatherData.main.temp)}°C
                    </motion.p>
                    <p className="capitalize">{weatherData.weather[0].description}</p>
                  </div>
                  <motion.img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt="Weather Icon"
                    className="w-20 h-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <strong>Humidity:</strong> {weatherData.main.humidity}%
                  </p>
                  <p>
                    <strong>Wind Speed:</strong> {weatherData.wind.speed} km/h
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Forecast display card - 5 days forecast is displayed */}
        {!isLoading && forecastData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>5-Day Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {forecastData.map((item, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 150 }}>
                  <Card className={`p-4 text-center ${cardBg}`}>
                    <p className="font-medium">
                      {new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt="Weather Icon"
                      className="w-12 h-12 mx-auto"
                    />
                    <p>{Math.round(item.main.temp)}°C</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;