const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const BASE_URL = 'https://betadash-search-download.vercel.app/sc';

module.exports = {
    name: 'soundcloud',
    description: 'Searches for songs on SoundCloud and provides a preview if available.',
    usage: 'soundcloud <song name>',
    author: 'developer',

    async execute(senderId, args, pageAccessToken) {
        if (!args.length) {
            return sendMessage(senderId, {
                text: '𝖯𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝗍𝗂𝗍𝗅𝖾.'
            }, pageAccessToken);
        }

        await searchSoundCloud(senderId, args.join(' '), pageAccessToken);
    }
};

const searchSoundCloud = async (senderId, query, pageAccessToken) => {
    try {
        const url = `${BASE_URL}?search=${encodeURIComponent(query)}`;
        const headResponse = await axios.head(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Content-Type': 'application/json',
            }
        });

        const fileSize = parseInt(headResponse.headers['content-length'], 10);
        const isTooLarge = fileSize > 25 * 1024 * 1024;

        // Use your provided thumbnail here
        const thumbnail = 'https://i.imgur.com/sVpNeaG.jpeg';

        const title = `Here your music: ${query}`;
        const subtitle = isTooLarge
            ? 'File size exceeds limit. Use the download button.'
            : 'Downloading please wait...';

        await sendMessage(senderId, {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: [{
                        title,
                        image_url: thumbnail,
                        subtitle,
                        buttons: [
                            {
                                type: 'web_url',
                                url,
                                title: isTooLarge ? 'Download File' : 'Open in Browser'
                            }
                        ]
                    }]
                }
            }
        }, pageAccessToken);

        if (!isTooLarge) {
            await sendMessage(senderId, {
                attachment: {
                    type: 'audio',
                    payload: {
                        url,
                        is_reusable: true
                    }
                }
            }, pageAccessToken);
        }

    } catch (error) {
        console.error('Error fetching SoundCloud music:', error.message);
        sendMessage(senderId, {
            text: '⚠️ Music not found or request failed. Please try again.'
        }, pageAccessToken);
    }
};
