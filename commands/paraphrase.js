const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// Helper to split long messages into chunks
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'paraphrase',
  description: 'Paraphrase your text to make it unique.',
  async execute(senderId, args, pageAccessToken) {
    const text = args.join(' ');

    if (!text) {
      return sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝘁𝗲𝘅𝘁 𝘁𝗼 𝗽𝗮𝗿𝗮𝗽𝗵𝗿𝗮𝘀𝗲.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: /paraphrase Learning is a lifelong journey...'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/paraphrase?text=${encodeURIComponent(text)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;
      const { data } = await axios.get(apiUrl);

      if (!data.response) {
        return sendMessage(senderId, {
          text: '𝗘𝗿𝗿𝗼𝗿: 𝗣𝗮𝗿𝗮𝗽𝗵𝗿𝗮𝘀𝗲 𝗿𝗲𝘀𝘂𝗹𝘁 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱.'
        }, pageAccessToken);
      }

      const messages = splitMessageIntoChunks(
        `📃 | 𝗘𝗻𝗵𝗮𝗻𝗰𝗲𝗱 𝗧𝗲𝘅𝘁:\n\n${data.response}`,
        2000
      );

      for (let i = 0; i < messages.length; i++) {
        await sendMessage(senderId, { text: messages[i] }, pageAccessToken);
      }

    } catch (error) {
      console.error('paraphrase command error:', error.message);
      await sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗿𝗲𝗮𝗰𝗵 𝘁𝗵𝗲 𝗽𝗮𝗿𝗮𝗽𝗵𝗿𝗮𝘀𝗲 𝗔𝗣𝗜.'
      }, pageAccessToken);
    }
  }
};
