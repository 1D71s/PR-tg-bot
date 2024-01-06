const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const { sequelize, Product, connectToDatabase } = require('./db');

const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());


const token = process.env.PUBLIC_BOT;
const tokenAdmin = process.env.ADMIN_BOT;

const webAppUrl = 'https://pr-tg-app.vercel.app/';

const bot = new TelegramBot(token, { polling: true });
const adminBot = new TelegramBot(tokenAdmin);

adminBot.setMyCommands([
    { command: '/start', description: 'Початок' },
    { command: '/product', description: 'Додати позицію' },
    { command: '/order', description: 'Замовлення' },
]);

adminBot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/product') {}
});

const adminId = [625210390];
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ви можете обрати замовлення нижче', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Обрати замовлення', web_app: { url: webAppUrl } }]
                ]
            }
        });
    }

    if (text === '/order') {
        adminBot.sendMessage(adminId[0], `Новый заказ от пользователя ${userId}: ${text}`);
    }
});

app.listen(port, () => {
    connectToDatabase();
    console.log(`Server is running on port ${port}`);
});