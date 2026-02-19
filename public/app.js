async function getWeather() {
  const city = document.getElementById("cityInput").value;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Loading...";

  try {
    const response = await fetch("/getGolfWeather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ city })
    });

    const data = await response.json();

    if (data.error) {
      resultDiv.innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    resultDiv.innerHTML = `
      <div class="card">
        <h2>${data.location}</h2>
        <p><strong>Temperature:</strong> ${data.weather.temperature}</p>
        <p><strong>Wind Speed:</strong> ${data.weather.windSpeed}</p>
        <p><strong>Condition:</strong> ${data.weather.condition}</p>
        <p><strong>Rain Probability:</strong> ${data.weather.rainProbability ?? "N/A"}%</p>

        <hr />

        <p><strong>Summary:</strong> ${data.recommendation.summary}</p>
        <p>${data.recommendation.temperatureImpact}</p>
        <p>${data.recommendation.windImpact}</p>
        <p>${data.recommendation.rainImpact}</p>
      </div>
    `;

  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">Error fetching weather</p>`;
  }
}