const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'history',
  description: 'search and know about historical events.',
  author: 'developer',

  async execute(senderId, args, pageAccessToken) {
    const searchQuery = args.join(" ").trim();

    if (!searchQuery) {
      return sendMessage(
        senderId,
        { text: "⌛ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘆𝗼𝘂𝗿 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗮𝗯𝗼𝘂𝘁 𝗵𝗶𝘀𝘁𝗼𝗿𝘆" },
        pageAccessToken
      );
    }

    try {
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`;
      const response = await axios.get(apiUrl);

      if (response.data.title && response.data.extract) {
        const title = response.data.title;
        const extract = response.data.extract;
        const message = `📜 𝗛𝗶𝘀𝘁𝗼𝗿𝗶𝗰𝗮𝗹 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 🔎\n\n➜ ${extract}`;
        return sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        return sendMessage(
          senderId,
          { text: `🚫 𝗡𝗼 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 ➜ "${searchQuery}".` },
          pageAccessToken
        );
      }
    } catch (error) {
      console.error('Error fetching historical information:', error);
      return sendMessage(
        senderId,
        { text: "❌ 𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗵𝗶𝘀𝘁𝗼𝗿𝗶𝗰𝗮𝗹 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻." },
        pageAccessToken
      );
    }
  }
};
