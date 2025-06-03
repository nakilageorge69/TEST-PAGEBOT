const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'dictionary',
  description: 'Look up word definitions using dictionary .',
  usage: 'dictionary <word>',
  async execute(senderId, args, pageAccessToken) {
    const word = args.join(' ');
    if (!word) {
      return sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘄𝗼𝗿𝗱 𝘁𝗼 𝗹𝗼𝗼𝗸 𝘂𝗽.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: /dictionary hello'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/dictionary?word=${encodeURIComponent(word)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.meanings || data.meanings.length === 0) {
        return sendMessage(senderId, {
          text: `𝗡𝗼 𝗱𝗲𝗳𝗶𝗻𝗶𝘁𝗶𝗼𝗻𝘀 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 "${word}".`
        }, pageAccessToken);
      }

      let message = `📚 𝗗𝗲𝗳𝗶𝗻𝗶𝘁𝗶𝗼𝗻𝘀 𝗳𝗼𝗿: *${data.word}*\n`;

      data.meanings.forEach((meaning, i) => {
        message += `\n${i + 1}. (${meaning.partOfSpeech})\n`;
        meaning.definitions.forEach((def, j) => {
          message += `   - ${def.definition}\n`;
          if (def.example) message += `     𝗘𝘅𝗮𝗺𝗽𝗹𝗲: ${def.example}\n`;
        });

        if (meaning.synonyms && meaning.synonyms.length > 0) {
          message += `   𝗦𝘆𝗻𝗼𝗻𝘆𝗺𝘀: ${meaning.synonyms.join(', ')}\n`;
        }

        if (meaning.antonyms && meaning.antonyms.length > 0) {
          message += `   𝗔𝗻𝘁𝗼𝗻𝘆𝗺𝘀: ${meaning.antonyms.join(', ')}\n`;
        }
      });

      const maxMessageLength = 2000;
      if (message.length > maxMessageLength) {
        const chunks = splitMessageIntoChunks(message, maxMessageLength);
        for (const chunk of chunks) {
          await sendMessage(senderId, { text: chunk }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: message }, pageAccessToken);
      }

    } catch (error) {
      console.error('dictionary command error:', error.message);
      await sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗳𝗲𝘁𝗰𝗵 𝗱𝗲𝗳𝗶𝗻𝗶𝘁𝗶𝗼𝗻 𝗳𝗿𝗼𝗺 𝗞𝗮𝗶𝘇 𝗔𝗣𝗜.'
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
