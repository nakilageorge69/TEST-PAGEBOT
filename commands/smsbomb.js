const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'smsbomb',
  description: 'Send SMS bomb to a phone number (for testing purposes).',
  usage: 'smsbomb <number> | <amount>',
  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').split('|').map(s => s.trim());

    if (input.length !== 2) {
      return sendMessage(senderId, {
        text: '❌ Usage: smsbomb phone | times\nExample: smsbomb 09123456789 | 5'
      }, pageAccessToken);
    }

    const [phone, times] = input;

    if (!phone || !times || isNaN(times)) {
      return sendMessage(senderId, {
        text: 'Invalid input. Make sure to enter a valid phone number and number of times.'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://haji-mix.up.railway.app/api/smsbomber?phone=${encodeURIComponent(phone)}&times=${encodeURIComponent(times)}&apikey=aafe0d9d17114eb257c6b98a02a6047cf0f7e4f5cd956515f2d3f295e8fb8b56`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.status) {
        return sendMessage(senderId, {
          text: 'Error: SMS bombing failed or invalid response from API.'
        }, pageAccessToken);
      }

      return sendMessage(senderId, {
        text: `📈 SMS bombing completed.\n✅ Success: ${data.details.success}\n❌ Failed:  ${data.details.failed}`
      }, pageAccessToken);

    } catch (error) {
      console.error('smsbomb command error:', error.message);
      await sendMessage(senderId, {
        text: 'Error: Failed to connect to SMS bomber API.'
      }, pageAccessToken);
    }
  }
};
