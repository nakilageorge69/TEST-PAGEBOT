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
  name: 'rewriter',
  description: 'Rewrite articles please provide.',
  usage: 'rewriter <text>',
  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    if (!query) {
      return sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗽𝗮𝗿𝗮𝗴𝗿𝗮𝗽𝗵 𝘁𝗼 𝗿𝗲𝘄𝗿𝗶𝘁𝗲.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: rewriter Love is a complex and multifaceted emotion...'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://zen-api.gleeze.com/api/rewrite-article?text=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || typeof data !== 'string') {
        return sendMessage(senderId, {
          text: '𝗘𝗿𝗿𝗼𝗿: 𝗨𝗻𝗲𝘅𝗽𝗲𝗰𝘁𝗲𝗱 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗳𝗿𝗼𝗺 𝗭𝗲𝗻 𝗔𝗣𝗜.'
        }, pageAccessToken);
      }

      const maxMessageLength = 2000;
      const messages = splitMessageIntoChunks(data, maxMessageLength);

      for (let i = 0; i < messages.length; i++) {
        await sendMessage(senderId, {
          text: i === 0 ? `✍️| 𝗥𝗲𝘄𝗿𝗶𝘁𝘁𝗲𝗻 𝗔𝗿𝘁𝗶𝗰𝗹𝗲:\n${messages[i]}` : messages[i]
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('rewriter command error:', error.message);
      await sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗿𝗲𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘁𝗼 𝗭𝗲𝗻 𝗔𝗣𝗜.'
      }, pageAccessToken);
    }
  }
};
