const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  'Content-Type': 'application/json',
};

const API_KEY = '80836f3451c2b3392b832988e7b73cdb';

module.exports = {
  name: 'ytdl',
  description: 'Download YouTube video',
  author: 'developer',
  usage: 'ytdl <youtube_url>',
  async execute(senderId, args, pageAccessToken) {
    const messageText = args.join(' ');
    const youtubeLinkRegex = /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/\S+/;

    if (!youtubeLinkRegex.test(messageText)) {
      await sendMessage(senderId, {
        text: 'Please provide a valid YouTube video link.'
      }, pageAccessToken);
      return;
    }

    try {
      await sendMessage(senderId, { text: '𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 𝖸𝗈𝗎𝗍𝗎𝖻𝖾 𝗏𝗂𝖽𝖾𝗈, 𝗉𝗅𝖾𝖺𝗌𝖾 𝗐𝖺𝗂𝗍...' }, pageAccessToken);

      const apiUrl = `https://api.zetsu.xyz/download/youtube?url=${encodeURIComponent(messageText)}&apikey=${API_KEY}`;

      const response = await axios.get(apiUrl, { headers });

      if (!response.data.status || !response.data.result.success) {
        await sendMessage(senderId, {
          text: 'Failed to download the YouTube video. Please check the URL or try again later.'
        }, pageAccessToken);
        return;
      }

      const result = response.data.result;
      const title = result.title || 'YouTube Video';
      const medias = result.medias;

      // Choose the best video with audio available (e.g. highest resolution video)
      // If you want, you can select by quality or extension here
      const videoMedia = medias.find(m => m.type === 'video' && m.url) || medias[0];

      if (!videoMedia || !videoMedia.url) {
        await sendMessage(senderId, {
          text: 'No downloadable video found.'
        }, pageAccessToken);
        return;
      }

      // Try to get file size with HEAD request
      let fileSize = 0;
      try {
        const headResponse = await axios.head(videoMedia.url, { headers });
        fileSize = parseInt(headResponse.headers['content-length'], 10);
      } catch {
        // HEAD might not be supported, ignore
      }

      // Messenger limit ~25 MB
      if (fileSize && fileSize > 25 * 1024 * 1024) {
        // Too large, send link instead
        await sendMessage(senderId, {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: `The video "${title}" exceeds the 25 MB limit and cannot be sent directly.`,
              buttons: [
                {
                  type: 'web_url',
                  url: videoMedia.url,
                  title: 'Watch Video'
                }
              ]
            }
          }
        }, pageAccessToken);
        return;
      }

      // Send video attachment directly
      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: videoMedia.url,
            is_reusable: true,
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('YouTube download error:', error.message);
      await sendMessage(senderId, {
        text: 'Failed to download the YouTube video. Please try again later.'
      }, pageAccessToken);
    }
  },
};
