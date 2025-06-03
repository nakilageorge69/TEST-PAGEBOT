const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
    name: 'tiksearch',
    description: 'Search TikTok videos by keyword.',
    usage: 'tiksearch <keywords>',
    author: 'Ry',

    async execute(senderId, args, pageAccessToken) {
        if (!args.length) {
            return sendMessage(senderId, {
                text: '❗ 𝖯𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝗍𝗂𝗄𝗍𝗈𝗄 𝗄𝖾𝗒𝗐𝗈𝗋𝖽.'
            }, pageAccessToken);
        }

        const query = args.join(' ');
        const url = `https://kaiz-apis.gleeze.com/api/tiksearch?search=${encodeURIComponent(query)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;

        try {
            const { data } = await axios.get(url);

            if (!data?.data?.videos?.length) {
                return sendMessage(senderId, {
                    text: '❌ No TikTok videos found. Try another keyword.'
                }, pageAccessToken);
            }

            const video = data.data.videos[0]; // First result

            // Preview card with buttons
            await sendMessage(senderId, {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: [{
                            title: video.title.slice(0, 80),
                            image_url: video.cover,
                            subtitle: `By: ${video.author.nickname || video.author.unique_id}`,
                            buttons: [
                                {
                                    type: 'web_url',
                                    url: video.play,
                                    title: 'Watch Video'
                                },
                                {
                                    type: 'web_url',
                                    url: video.music,
                                    title: 'Audio Only'
                                }
                            ]
                        }]
                    }
                }
            }, pageAccessToken);

            // Send video directly (non-watermarked if available)
            await sendMessage(senderId, {
                attachment: {
                    type: 'video',
                    payload: {
                        url: video.play,
                        is_reusable: true
                    }
                }
            }, pageAccessToken);

        } catch (err) {
            console.error('TikTok search error:', err.message);
            return sendMessage(senderId, {
                text: '⚠️ Failed to fetch TikTok video. Please try again later.'
            }, pageAccessToken);
        }
    }
};
