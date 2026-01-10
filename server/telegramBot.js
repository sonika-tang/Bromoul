const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
// Create a bot that uses 'polling' to fetch new updates if separate process, 
// but since we are just sending, we might not need polling unless we want to receive commands.
// For this MVP, we just want to send notifications.
// If token is missing, we'll log a warning and mock the send.

let bot = null;
if (token) {
    bot = new TelegramBot(token, { polling: true });
    // Handle /start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;

        // Log Chat ID for developer
        console.log('------------------------------------------------');
        console.log('✨ NEW USER STARTED BOT ✨');
        console.log(`🆔 Chat ID: ${chatId}`);
        console.log('------------------------------------------------');

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🌐 ចូលទៅកាន់គេហទំព័រ (Open Website)', web_app: { url: 'https://bromoul.vercel.app/' } }]
                ]
            }
        };

        const message = `សូមស្វាគមន៍មកកាន់ ព្រមមូល (Bromoul)! 🌱\n\n` +
            `ចុចប៊ូតុងខាងក្រោមដើម្បីចាប់ផ្តើមប្រើប្រាស់។`;

        bot.sendMessage(chatId, message, opts);
    });

    // Log for debugging
    console.log('Telegram Bot is running...');
} else {
    console.warn('TELEGRAM_BOT_TOKEN not found in .env. Notification will be mocked.');
}

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
