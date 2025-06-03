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
  name: 'summarize',
  description: 'Summarize a paragraph.',
  usage: 'summarize <text>',
  async execute(senderId, args, pageAccessToken) {
    const text = args.join(' ');

    if (!text) {
      return sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘁𝗲𝘅𝘁 𝘁𝗼 𝘀𝘂𝗺𝗺𝗮𝗿𝗶𝘇𝗲.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: summarize Love is a powerful emotion...'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/summarizer?text=${encodeURIComponent(text)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;
      const { data } = await axios.get(apiUrl);

      if (!data.summary) {
        return sendMessage(senderId, {
          text: '𝗘𝗿𝗿𝗼𝗿: 𝗦𝘂𝗺𝗺𝗮𝗿𝘆 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱.'
        }, pageAccessToken);
      }

      const messages = splitMessageIntoChunks(
        `𝗦𝘂𝗺𝗺𝗮𝗿𝘆:\n${data.summary}\n\n𝗞𝗲𝘆𝘄𝗼𝗿𝗱𝘀:\n${data.keywords?.join(', ') || 'None'}`,
        2000
      );

      for (let i = 0; i < messages.length; i++) {
        await sendMessage(senderId, { text: messages[i] }, pageAccessToken);
      }

    } catch (error) {
      console.error('summarize command error:', error.message);
      await sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗿𝗲𝗮𝗰𝗵 𝘁𝗵𝗲 𝘀𝘂𝗺𝗺𝗮𝗿𝗶𝘇𝗲𝗿 𝗔𝗣𝗜.'
      }, pageAccessToken);
    }
  }
};
