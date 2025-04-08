const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export const fetchWeatherData = async (city: string) => {
  const weatherRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );
  const forecastRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );

  if (!weatherRes.ok || !forecastRes.ok) {
    throw new Error("City not found or API error");
  }

  const weatherJson = await weatherRes.json();
  const forecastJson = await forecastRes.json();

  return { weatherJson, forecastJson };
};
