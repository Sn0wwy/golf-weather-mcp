import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config()

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Health check
app.get("/", (_, res) => {
    res.send("Golf Weather MCP Server is running");
});

// MCP Tool Endpoint
app.post("/getGolfWeather", async (req, res) => {
    try {
        const { city, lat, lon, units = "imperial" } = req.body;

        if (!city && (lat === undefined || lon === undefined )) {
            return res.status(400).json({ error: "City or Lat/Lon are required"});
        }

        const queryParams: any = {
            appid: API_KEY,
            units
        };

        if(city) {
            queryParams.q = city;
        } else {
            queryParams.lat = lat;
            queryParams.lon = lon;
        }

        // Current weather
        const currentRes = await axios.get(
            "https://api.openweathermap.org/data/2.5/weather",
            { params: queryParams }
        );

        // Forecast (rain probability)
        const forecastRes = await axios.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            { params: queryParams }
        );

        const current = currentRes.data;
        const forecast = forecastRes.data;

        const temperature = current.main.temp;
        const windSpeed = current.wind.speed;
        const condition = current.weather[0].description;

        // Get next forecast block (3 hour increment)
        const nextForecast = forecast.list[0];
        const rainProbability = nextForecast?.pop ?? null; // 0-1

        // Recommendation logic

        const rainPercent = rainProbability !== null
            ? Math.round(rainProbability * 100)
            : null;

        let tempNote = "";
        if (temperature < 45) tempNote = "Cold temperatures.";
        else if (temperature > 90) tempNote = "High heat — hydrate and expect fatigue.";
        else tempNote = "Comfortable temperature for golfing.";

        let windNote = "";
        if (windSpeed > 25) windNote = "Very windy — expect difficulty for play.";
        else if (windSpeed > 15) windNote = "Moderate wind — take into consideration to control trajectory.";
        else windNote = "Wind conditions are manageable.";

        let rainNote = "";
        if (rainPercent !== null) {
        if (rainPercent > 60) rainNote = "High chance of rain — consider rescheduling.";
        else if (rainPercent > 30) rainNote = "Possible rain — pack rain gear.";
        else rainNote = "Low probability of rain.";
        } else {
        rainNote = "Rain probability unavailable.";
        }

        let overallSummary = "Great day for golf.";
        if (temperature < 45 || windSpeed > 25 || (rainPercent ?? 0) > 60) {
            overallSummary = "Challenging conditions expected.";
        }

        // JSON response
        res.json({
            location: city || `${lat},${lon}`,
            weather: {
                temperature,
                windSpeed,
                condition,
                rainProbability: rainPercent
            },
            recommendation: {
                summary: overallSummary,
                temperatureImpact: tempNote,
                windImpact: windNote,
                rainImpact: rainNote
            }
        });

    } catch (error: any) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to fetch weather",
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
