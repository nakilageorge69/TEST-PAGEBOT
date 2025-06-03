const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

function splitMessage(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'recipe',  // Command name
  description: 'Get a detailed recipe based on the ingredient you provide.',  // Description
  usage: 'recipe {ingredient}',  // Usage
  author: 'developer',  // Author

  // Main function that executes the command
  async execute(senderId, args, pageAccessToken) {
    // Check if an ingredient is provided
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: '𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮𝗻 𝗶𝗻𝗴𝗿𝗲𝗱𝗶𝗲𝗻𝘁.\n𝗨𝘀𝗮𝗴𝗲: recipe <ingredient>' }, pageAccessToken);
      return;
    }

    // Form the ingredient query and notify the user that the search is in progress
    const ingredient = args.join(' ');
    await sendMessage(senderId, { text: `🔍 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗿𝗲𝗰𝗶𝗽𝗲 𝗳𝗼𝗿 “${ingredient}”, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...` }, pageAccessToken);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/recipe?ingredients=${encodeURIComponent(ingredient)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data?.recipe) {
        await sendMessage(senderId, { text: '❌ 𝗡𝗼 𝗿𝗲𝗰𝗶𝗽𝗲 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 𝘁𝗵𝗮𝘁 𝗶𝗻𝗴𝗿𝗲𝗱𝗶𝗲𝗻𝘁.' }, pageAccessToken);
        return;
      }

      // Format the recipe information with bold headings
      const message = `𝗥𝗲𝗰𝗶𝗽𝗲 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻\n━━━━━━━━━━━━━\n${data.recipe}\n━━━━━━━━━━━━━`;

      const chunkSize = 2000;
      if (message.length > chunkSize) {
        const chunks = splitMessage(message, chunkSize);
        for (const chunk of chunks) {
          await sendMessage(senderId, { text: chunk }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: message }, pageAccessToken);
      }
    } catch (err) {
      console.error('Recipe API Error:', err.message);
      await sendMessage(senderId, { text: '❌ 𝗘𝗿𝗿𝗼𝗿: 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗿𝗲𝗰𝗶𝗽𝗲. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.' }, pageAccessToken);
    }
  }
};
