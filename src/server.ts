import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config()

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Health check
app.get("/", (_, res) => {
    res.send("Golf Weather MCP Server is running");
});

// MCP Tool Endpoint
app.post("/getGolfWeather", async (req, res) => {
    try {
        const { city } = req.body;

        if (!city) {
            return res.status(400).json({ error: "City is required"});
        }

        const weatherResponse = await axios.get(
            'https://api.openweathermap.org/data/2.5/weather',
            {
                params: {
                    q: city,
                    appid: API_KEY,
                    units: "imperial"
                }
            }
        );

        const data = weatherResponse.data;

        const temperature = data.main.temp;
        const windSpeed = data.wind.speed;
        const condition = data.weather[0].description;

        // Simple golf logic
        let recommendation = "Great day for golf!";
        if (windSpeed > 20) recommendation = "Very windy - expect tough drives."
        if (temperature < 45) recommendation = "Too cold for most golfers.";
        if (condition.includes("rain")) recommendation = "Rain expected - consider rescheduling.";

        res.json({
            city,
            temperature,
            windSpeed,
            condition,
            recommendation
        });

    } catch (error: any) {
        res.status(500).json({
            error: "Failed to fetch weather",
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
