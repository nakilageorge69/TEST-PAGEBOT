const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'wikipedia',
  description: 'Search and know about any topic.',
  usage: 'wikipedia <topic>',
  author: 'developer',

  async execute(senderId, args, pageAccessToken) {
    const searchQuery = args.join(" ").trim();

    if (!searchQuery) {
      return sendMessage(
        senderId,
        { text: '❗ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘀𝗲𝗮𝗿𝗰𝗵 𝗾𝘂𝗲𝗿𝘆 (e.g., wikipedia Albert Einstein).' },
        pageAccessToken
      );
    }

    try {
      const apiUrl = `https://ccprojectsapis.zetsu.xyz/api/wiki?q=${encodeURIComponent(searchQuery)}`;
      const { data } = await axios.get(apiUrl);

      if (data.title && data.extract) {
        const message = `🎓 𝗪𝗶𝗸𝗶𝗽𝗲𝗱𝗶𝗮 𝗦𝗲𝗮𝗿𝗰𝗵 🔎\n\n➜ ${data.extract}`;
        return sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        return sendMessage(
          senderId,
          { text: `🚫 𝗡𝗼 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 ➜ "${searchQuery}".` },
          pageAccessToken
        );
      }
    } catch (error) {
      console.error("Error fetching Wikipedia information:", error);
      return sendMessage(
        senderId,
        { text: '❌ 𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻.' },
        pageAccessToken
      );
    }
  }
};
