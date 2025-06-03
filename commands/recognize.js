const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

const fontMapping = {
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
  'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
  'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
  'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
  'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
  'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
  'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇'
};

function convertToBold(text) {
  return text.replace(/(?:\*\*(.*?)\*\*|## (.*?)|### (.*?))/g, (match, boldText, h2Text, h3Text) => {
    const targetText = boldText || h2Text || h3Text;
    return [...targetText].map(char => fontMapping[char] || char).join('');
  });
}

module.exports = {
  name: "recognize",
  description: "Analyze image and question using Gemini",
  author: "developer",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    const userPrompt = args.join(" ");
    const repliedMessage = event.message.reply_to?.message || "";
    const finalPrompt = repliedMessage ? `${repliedMessage} ${userPrompt}`.trim() : userPrompt;

    if (!finalPrompt) {
      return sendMessage(senderId, {
        text: "𝖯𝖱𝖮𝖵𝖨𝖣𝖤 𝖰𝖴𝖤𝖲𝖳𝖨𝖮𝖭 𝖮𝖱 𝖨𝖬𝖠𝖦𝖤."
      }, pageAccessToken);
    }

    try {
      // Extract image URL from attachments if not explicitly passed
      if (!imageUrl) {
        if (event.message.reply_to && event.message.reply_to.mid) {
          imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
        } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }
      }

      const response = await handleImageRecognition(finalPrompt, imageUrl);
      const result = response.description || "No description returned.";

      const visionResponse = `
𝖦𝖤𝖬𝖨𝖭𝖨 𝖵𝖨𝖲𝖨𝖮𝖭
─────────────
${convertToBold(result)}
─────────────`;

      await sendConcatenatedMessage(senderId, visionResponse, pageAccessToken);
    } catch (error) {
      console.error("Error in Gemini command:", error);
      sendMessage(senderId, {
        text: `Error: ${error.message || "Something went wrong."}`
      }, pageAccessToken);
    }
  }
};

async function handleImageRecognition(prompt, imageUrl) {
  try {
    const { data } = await axios.get("https://apis-rho-nine.vercel.app/gemini", {
      params: {
        ask: prompt,
        imagurl: imageUrl || ""
      }
    });
    return data;
  } catch (error) {
    throw new Error("Failed to connect to the Gemini API.");
  }
}

async function getRepliedImage(mid, pageAccessToken) {
  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });
    return data?.data[0]?.image_data?.url || "";
  } catch (error) {
    throw new Error("Failed to retrieve replied image.");
  }
}

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;
  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
      }
