const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// Define and export module
module.exports = {
  // Metadata for the command
  name: 'weather',  // Command name
  description: 'get current weather information for a location.',  // Description 
  usage: 'weather {location}',  // Usage
  author: 'developer',  // Author of the command

  // Main function that executes the command
  async execute(senderId, args, pageAccessToken) {
    // Check if location arguments are provided
    if (!args || args.length === 0) {
      // Send message requesting a location if missing
      await sendMessage(senderId, {
        text: '𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝘀𝗽𝗲𝗰𝗶𝗳𝗶𝗰 𝗹𝗼𝗰𝗮𝘁𝗶𝗼𝗻.'
      }, pageAccessToken);
      return;  // Exit the function if no location is provided
    }

    // Concatenate arguments to form the location name
    const location = args.join(' ');
    const weatherApiUrl = `https://kaiz-apis.gleeze.com/api/weather?q=${encodeURIComponent(location)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;

    try {
      // Fetch weather data from API
      const response = await axios.get(weatherApiUrl);
      const weatherData = response.data["0"]; // Extract the relevant object

      if (!weatherData) {
        throw new Error("Invalid response format.");
      }

      const { 
        location: place, 
        current 
      } = weatherData;

      // Extract required weather details
      const {
        temperature,
        skytext,
        humidity,
        winddisplay,
        feelslike,
        date,
        observationtime,
        observationpoint
      } = current;

      // Format the weather information
      const weatherInfo = `
   📍𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${place.name}
   🌡️𝗧𝗲𝗺𝗽𝗲𝗿𝗮𝘁𝘂𝗿𝗲: ${temperature}°C
   ⛅𝗦𝗸𝘆: ${skytext}
   💧𝗛𝘂𝗺𝗶𝗱𝗶𝘁𝘆: ${humidity}%
   🌬️𝗪𝗶𝗻𝗱: ${winddisplay}
   🌡️𝗙𝗲𝗲𝗹𝘀 𝗟𝗶𝗸𝗲: ${feelslike}°C
   📅𝗗𝗮𝘁𝗲: ${date}
   ⏰𝗢𝗯𝘀𝗲𝗿𝘃𝗮𝘁𝗶𝗼𝗻 𝗧𝗶𝗺𝗲: ${observationtime}
   📍𝗢𝗯𝘀𝗲𝗿𝘃𝗮𝘁𝗶𝗼𝗻 𝗣𝗼𝗶𝗻𝘁: ${observationpoint}
      `;

      // Send weather information as text
      await sendMessage(senderId, { text: weatherInfo.trim() }, pageAccessToken);

    } catch (error) {
      // Handle errors and notify the user
      console.error('Error fetching weather info:', error);
      await sendMessage(senderId, {
        text: 'Sorry, an error occurred while fetching weather information.'
      }, pageAccessToken);
    }
  }
};
