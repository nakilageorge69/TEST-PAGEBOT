const axios = require('axios');
const sendMessages = require('../handles/sendMessages');

module.exports = {
  name: "pinterest",
  description: "Search for images from Pinterest",
  author: "developer",

  async execute(senderId, args, pageAccessToken) {
    try {
      if (args.length === 0) {
        return sendMessages(senderId, {
          text: "🖼️ • Invalid format!\nUse: pinterest [search] - [1-25]\nExample: pinterest cat - 10"
        }, pageAccessToken);
      }

      const [searchTerm, count] = args.join(" ").split(" - ");
      const numOfImages = parseInt(count);

      if (!searchTerm || !numOfImages || isNaN(numOfImages) || numOfImages < 1 || numOfImages > 25) {
        return sendMessages(senderId, {
          text: "🖼️ • Invalid number! Choose between 1 and 25 images.\nExample: pinterest dogs - 5"
        }, pageAccessToken);
      }

      const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/pin?title=${encodeURIComponent(searchTerm)}&count=${numOfImages}`;
      const response = await axios.get(apiUrl);
      const data = response.data.data;

      if (!data || data.length === 0) {
        return sendMessages(senderId, {
          text: `❌ No results found for "${searchTerm}".`
        }, pageAccessToken);
      }

      for (const url of data.slice(0, numOfImages)) {
        await sendMessages(senderId, {
          attachment: {
            type: "image",
            payload: { url }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error("Pinterest error:", error.message);
      sendMessages(senderId, {
        text: `❌ Failed to fetch images.\nError: ${error.message}`
      }, pageAccessToken);
    }
  }
};
