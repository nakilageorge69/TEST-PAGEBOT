const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'arxiv',
  description: 'fetch article from arxiv.',
  usage: 'arxiv <word>',
  author: 'developer',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    if (!query) {
      return sendMessage(senderId, {
        text: '❌ 𝗨𝘀𝗮𝗴𝗲: 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘄𝗼𝗿𝗱\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 𝗮𝗿𝘅𝗶𝘃 𝗹𝗼𝘃𝗲'
      }, pageAccessToken);
    }

    // Notify the user about the ongoing process
    await sendMessage(senderId, {
      text: '⌛ 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..'
    }, pageAccessToken);

    try {
      // API request
      const apiUrl = `https://jerome-web.gleeze.com/service/api/arxiv?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Parse API response
      const { query_info, article } = response.data;

      if (!article) {
        return sendMessage(senderId, {
          text: `❌ No articles found for the query: **${query}**.`
        }, pageAccessToken);
      }

      // Prepare response message
      const message = `
─────────────
📄𝗧𝗶𝘁𝗹𝗲: ${article.title}
🖋️𝗔𝘂𝘁𝗵𝗼𝗿𝘀: ${article.authors.join(', ')}
📆𝗣𝘂𝗯𝗹𝗶𝘀𝗵𝗲𝗱: ${article.published}\n
📜𝗦𝘂𝗺𝗺𝗮𝗿𝘆:\n•${article.summary}\n
🔗𝗟𝗶𝗻𝗸 𝗼𝗳 𝗮𝗿𝘁𝗶𝗰𝗹𝗲: ${article.id}
─────────────
      `;

      await sendMessage(senderId, {
        text: message
      }, pageAccessToken);
    } catch (error) {
      console.error('❌ Error fetching article:', error.response?.data || error.message);
      await sendMessage(senderId, {
        text: '❌ An error occurred while fetching the article. Please try again later.'
      }, pageAccessToken);
    }
  }
};
