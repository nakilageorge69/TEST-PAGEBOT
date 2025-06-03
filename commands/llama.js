const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'llama',
  description: 'Chat with LLaMA 3 Turbo.',
  usage: 'llama <ask>',
  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    if (!query) {
      return sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝗾𝘂𝗲𝗿𝘆 𝗳𝗼𝗿 𝗟𝗹𝗮𝗺𝗮.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: /llama What is the capital of Italy?'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/llama3-turbo?ask=${encodeURIComponent(query)}&uid=${senderId}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;

      const { data } = await axios.get(apiUrl);

      if (!data.response) {
        return sendMessage(senderId, {
          text: '𝗘𝗿𝗿𝗼𝗿: 𝗡𝗼 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗿𝗲𝗰𝗲𝗶𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝗟𝗹𝗮𝗺𝗮.'
        }, pageAccessToken);
      }

      const messages = splitMessageIntoChunks(data.response, 2000);
      for (let i = 0; i < messages.length; i++) {
        await sendMessage(senderId, {
          text: i === 0 ? `
🦙 | 𝗟𝗹𝗮𝗺𝗮:
─────────────
${messages[i]}
─────────────` : messages[i]
        }, pageAccessToken);
      }

    } catch (err) {
      console.error('LLaMA API error:', err.message);
      await sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗰𝗼𝗻𝘁𝗮𝗰𝘁 𝗟𝗹𝗮𝗺𝗮 𝗔𝗣𝗜.'
      }, pageAccessToken);
    }
  }
};
