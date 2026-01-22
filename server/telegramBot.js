const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;
if (token) {
  // Enable polling so the bot can receive commands like /start
  bot = new TelegramBot(token, { polling: true });

  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    console.log('✨ NEW USER STARTED BOT ✨');
    console.log(`Chat ID: ${chatId}`);

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌐 ចូលទៅកាន់គេហទំព័រ (Open Website)',
              web_app: { url: 'https://bromoul.vercel.app/' }
            }
          ]
        ]
      }
    };

    const message =
      `សូមស្វាគមន៍មកកាន់ ប្រមូល (Bromoul)! 🌱\n\n` +
      `ចុចប៊ូតុងខាងក្រោមដើម្បីចាប់ផ្តើមប្រើប្រាស់។`;

    bot.sendMessage(chatId, message, opts);
  });

  console.log('Telegram Bot initialized with polling…');
} else {
  console.warn('TELEGRAM_BOT_TOKEN not found in .env. Notification will be mocked.');
}

// Function to send notifications programmatically
const sendNotification = async (message) => {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (bot && chatId) {
    try {
      await bot.sendMessage(chatId, message);
      return { success: true, message: 'Telegram sent' };
    } catch (error) {
      console.error('Telegram Error:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.log('[MOCK TELEGRAM]:', message);
    return { success: true, message: 'Mock sent (check console)' };
  }
};

module.exports = { sendNotification };
