const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.PUBLIC_BOT;
const tokenAdmin = process.env.ADMIN_BOT;

const bot = new TelegramBot(token, { polling: true });
const adminBot = new TelegramBot(tokenAdmin);

bot.setMyCommands([
    { command: '/start', description: 'Початок' },
    { command: '/product', description: 'Обрати замовлення' },
    { command: '/backet', description: 'Кошик' },
    { command: '/order', description: 'Відправити замовлення' },
    { command: '/info', description: 'Інформація про піцерію' },
])

adminBot.setMyCommands([
    { command: '/start', description: 'Початок' },
    { command: '/product', description: 'Додати позицію' },
    { command: '/order', description: 'Замовлення' },
])

adminBot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
})

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    bot.sendMessage(chatId, 'Received your message');

    if (text === '/order') {
        adminBot.sendMessage(chatId, 'Тестовое сообщение с другого бота');
    }
});