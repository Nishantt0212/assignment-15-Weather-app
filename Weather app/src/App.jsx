import React, { useState, useRef } from 'react';
import './App.css';

const API_KEY = '0253bf222121437f81863036252707'; // Demo key from reference

function App() {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceTimeout = useRef();

  // Fetch city suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    setError('');
    setWeather(null);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceTimeout.current = setTimeout(() => {
      fetch(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSuggestions(data);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        })
        .catch(() => {
          setSuggestions([]);
          setShowSuggestions(false);
        });
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setCity(`${suggestion.name}, ${suggestion.country}`);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Hide suggestions on outside click
  const inputRef = useRef();
  React.useEffect(() => {
    const handleClick = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch weather
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setWeather(null);
    setError('');
    fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current && data.location) {
          setWeather({
            name: data.location.name,
            country: data.location.country,
            temp_c: data.current.temp_c,
            temp_f: data.current.temp_f,
            condition: data.current.condition.text,
            icon: data.current.condition.icon,
            feelslike_c: data.current.feelslike_c,
            humidity: data.current.humidity,
            wind_kph: data.current.wind_kph,
          });
        } else {
          setError('No weather data found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch weather data.');
        setLoading(false);
      });
  };

  return (
    <div className="weather-app">
      <h2>Weather App</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="input-wrapper" ref={inputRef}>
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={handleInputChange}
            required
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((s) => (
                <div
                  key={s.id || s.name + s.country}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.name}, {s.country}
                </div>
              ))}
            </div>
          )}
        </div>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </form>
      <div className="weather-result">
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {weather && (
          <div>
            <h3>
              {weather.name}, {weather.country}
            </h3>
            <img src={weather.icon} alt={weather.condition} />
            <div>{weather.condition}</div>
            <div>
              <b>{weather.temp_c}°C</b> / {weather.temp_f}°F
            </div>
            <div>Feels like: {weather.feelslike_c}°C</div>
            <div>Humidity: {weather.humidity}%</div>
            <div>Wind: {weather.wind_kph} kph</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;