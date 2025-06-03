const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ocr',
  description: 'Extract text from an image using OCR.',
  usage: 'send image then type ocr',
  author: 'developer',

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: 'No attachment detected. Please send an image first.'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '⌛ 𝗘𝘅𝘁𝗿𝗮𝗰𝘁𝗶𝗻𝗴 𝘁𝗲𝘅𝘁 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...'
    }, pageAccessToken);

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/ocr?url=${encodeURIComponent(imageUrl)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`);
      const extractedText = response?.data?.text;

      if (!extractedText) {
        throw new Error('❌ No text found in the image.');
      }

      const message = `✅ 𝗘𝘅𝘁𝗿𝗮𝗰𝘁𝗲𝗱 𝗧𝗲𝘅𝘁:\n\n${extractedText}`;
      const maxMessageLength = 2000;

      if (message.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(message, maxMessageLength);
        for (const chunk of messages) {
          await sendMessage(senderId, { text: chunk }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: message }, pageAccessToken);
      }
    } catch (error) {
      console.error('❌ Error extracting text from image:', error.response?.data || error.message);
      await sendMessage(senderId, {
        text: '❌ An error occurred while extracting text from the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
