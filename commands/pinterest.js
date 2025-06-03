const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // Proper import

module.exports = {
  name: "pinterest",
  description: "Searching pics from Pinterest (different API)",
  usage: 'pinterest <searchterm> - <limit>',
  author: "developer",

  async execute(senderId, args, pageAccessToken) {
    try {
      if (args.length === 0) {
        return sendMessage(senderId, {
          text: "𝗨𝘀𝗮𝗴𝗲: 𝗽𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 𝗱𝗼𝗴 - 10"
        }, pageAccessToken);
      }

      const [searchTerm, count] = args.join(" ").split(" - ");

      if (!searchTerm || !count) {
        return sendMessage(senderId, {
          text: "𝗨𝘀𝗮𝗴𝗲: 𝗽𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 𝗱𝗼𝗴 - 10"
        }, pageAccessToken);
      }

      const numOfImages = parseInt(count) || 5;
      if (isNaN(numOfImages) || numOfImages < 1 || numOfImages > 30) {
        return sendMessage(senderId, {
          text: "Please provide a valid number of images (1–30)."
        }, pageAccessToken);
      }

      const apiUrl = `https://ccprojectsapis.zetsu.xyz/api/pin?title=${encodeURIComponent(searchTerm)}&count=${numOfImages}`;
      console.log(`Fetching data from API: ${apiUrl}`);
      const response = await axios.get(apiUrl);

      const data = response.data.data;
      if (!data || data.length === 0) {
        return sendMessage(senderId, { text: `No results found for "${searchTerm}".` }, pageAccessToken);
      }

      for (const url of data.slice(0, numOfImages)) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: { url }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error("Failed to retrieve images from Pinterest:", error);
      sendMessage(senderId, {
        text: `❌ Failed to retrieve images from Pinterest. Error: ${error.message || error}`
      }, pageAccessToken);
    }
  }
};
