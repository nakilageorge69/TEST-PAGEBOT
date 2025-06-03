const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'humanize',
  description: 'Humanize the AI-generated text',
  usage: 'humanizer [AI-generated text here]',
  author: 'developer',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, { text: "𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝗔𝗜 𝘁𝗲𝘅𝘁" }, pageAccessToken);
    }

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/humanizer?q=${encodeURIComponent(prompt)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`);
      const mess = response.data.response;

      const chunkSize = 2000;
      const parts = [];

      for (let i = 0; i < mess.length; i += chunkSize) {
        parts.push(mess.substring(i, i + chunkSize));
      }

      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }
    } catch (error) {
      console.error('Humanizer error:', error.message);
      await sendMessage(senderId, { text: 'There was an error generating the content. Please try again later.' }, pageAccessToken);
    }
  }
};
