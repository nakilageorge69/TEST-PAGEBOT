const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
    name: 'music',
    description: 'Search and download Spotify track.',
    usage: 'music <song name>',
    author: 'GeoDevz69',

    async execute(senderId, args, pageAccessToken) {
        if (!args.length) {
            return sendMessage(senderId, { text: '❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘁𝗶𝘁𝗹𝗲.' }, pageAccessToken);
        }
        await searchSpotify(senderId, args.join(' '), pageAccessToken);
    }
};

const searchSpotify = async (senderId, query, pageAccessToken) => {
    try {
        const searchURL = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${encodeURIComponent(query)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;
        const searchRes = await axios.get(searchURL);
        const track = searchRes.data[0];

        if (!track || !track.trackUrl) {
            return sendMessage(senderId, { text: 'No track found.' }, pageAccessToken);
        }

        const downloadURL = `https://kaiz-apis.gleeze.com/api/spotify-down?url=${encodeURIComponent(track.trackUrl)}&apikey=ec7d563d-adae-4048-af08-0a5252f336d1`;
        const dlRes = await axios.get(downloadURL);
        const { title, url, artist, thumbnail } = dlRes.data;

        // Send song info with thumbnail
        await sendMessage(senderId, {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: `🎵 Title: ${title}`,
                        image_url: thumbnail,
                        subtitle: `👤 Artist: ${artist}`
                    }]
                }
            }
        }, pageAccessToken);

        // Send audio file link
        await sendMessage(senderId, {
            attachment: {
                type: 'audio',
                payload: { url }
            }
        }, pageAccessToken);

    } catch (error) {
        console.error("Spotify Error:", error);
        sendMessage(senderId, { text: 'An error occurred while processing your request.' }, pageAccessToken);
    }
};
