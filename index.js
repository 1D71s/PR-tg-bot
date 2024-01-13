import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';

import { connectToDatabase } from './db/connect.js';

import { telegramBotModule } from './bots/telegramBot/telegramBot.js';
import { adminBotModule } from './bots/adminBot/adminBot.js';

import { getProducts } from './controllers/product.js'
import { createOrder } from './controllers/order.js'

const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

const token = process.env.PUBLIC_BOT;
const tokenAdmin = process.env.ADMIN_BOT;

const webAppUrl = process.env.PUBLIC_APP;

const bot = new TelegramBot(token, { polling: true });
const adminBot = new TelegramBot(tokenAdmin, { polling: true });
const adminId = [625210390];

adminBotModule(adminBot)
telegramBotModule(bot, webAppUrl, adminBot)

app.get('/products', (req, res) => getProducts(res))
app.post('/order', (req, res) => createOrder(req, res, adminBot, bot, adminId))

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
