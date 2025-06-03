const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const fs = require("fs");

const token = fs.readFileSync("token.txt", "utf8");

const apiKeys = [
  "ec7d563d-adae-4048-af08-0a5252f336d1",
  "",
  "",
  "",
  "",
  ""
];

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
  name: "ai",
  description: "Ask Arlene AI for a response.",
  usage: 'send message',
  author: "developer",

  async execute(senderId, args) {
    const pageAccessToken = token;
    const rawPrompt = (args.join(" ") || "").trim();
    const userPrompt = rawPrompt;

    if (!userPrompt) {
      return sendMessage(senderId, { text: "𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁." }, pageAccessToken);
    }

    try {
      if (/^(create|draw|generate|imagine|drawing)\b/i.test(userPrompt)) {
        const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/generate-art?prompt=${encodeURIComponent(rawPrompt)}`;
        return await sendMessage(senderId, {
          attachment: { type: 'image', payload: { url: apiUrl } }
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Image generation error:", error.message);
    }

    await handleGeminiResponse(senderId, userPrompt, pageAccessToken);
  },
};

const handleGeminiResponse = async (senderId, input, pageAccessToken) => {
  const systemRole = "You are 𝗔𝗿𝗹𝗲𝗻𝗲 𝗔𝗜, a lovely assistant who helps kindly and creatively.";
  const prompt = `${systemRole}\n${input}`;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/gemini-vision?q=${encodeURIComponent(prompt)}&uid=${senderId}&apikey=${apiKey}`;

    try {
      const { data } = await axios.get(apiUrl);
      let responseText = data.response || "❌ No response from Arlene.";

      const whoRegex = /(who\s+are\s+you|what'?s\s+your\s+name|identify\s+yourself|who\s+is\s+this|what\s+are\s+you|are\s+you\s+a\s+bot|are\s+you\s+human)/i;
      if (whoRegex.test(input) && !/Arlene AI/i.test(responseText)) {
        responseText += `\n\nI am ${convertToBold("Arlene AI")}, your lovely assistant.`;
      }

      let formatted = convertToBold(responseText);
      formatted = formatted.replace(/Arlene AI/g, convertToBold("Arlene AI"));

      const message = `
🤖 | 𝖠𝖱𝖫𝖤𝖭𝖤 𝖠𝖨
─────────────
${formatted}
─────────────`;

      return await sendConcatenatedMessage(senderId, message, pageAccessToken);
    } catch (error) {
      console.warn(`Key failed [${apiKey}]: ${error.message}`);
      if (i === apiKeys.length - 1) {
        return sendError(senderId, "❌ Error: All API keys failed or quota exceeded.", pageAccessToken);
      }
    }
  }
};

const sendConcatenatedMessage = async (senderId, text, pageAccessToken) => {
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
};

const splitMessageIntoChunks = (message, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
};

const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};
