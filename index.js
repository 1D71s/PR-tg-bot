import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';

import { connectToDatabase } from './db/connect.js';

import { telegramBotModule } from './bots/telegramBot/telegramBot.js';
import { adminBotModule } from './bots/adminBot/adminBot.js';

import { test, getProducts } from './controllers/product.js'

const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

const token = process.env.PUBLIC_BOT;
const tokenAdmin = process.env.ADMIN_BOT;

const webAppUrl = process.env.PUBLIC_APP;

const bot = new TelegramBot(token, { polling: true });
const adminBot = new TelegramBot(tokenAdmin, { polling: true });


adminBotModule(adminBot)
telegramBotModule(bot, webAppUrl, adminBot)

app.get('/getImage', (req, res) => test(res))
app.get('/products', (req, res) => getProducts(res))

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})