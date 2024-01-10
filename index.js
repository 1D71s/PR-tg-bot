import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';

import { connectToDatabase } from './db/connect.js';

import { router as productRoute } from './routes/product.js';

import { telegramBotModule } from './bots/telegramBot.js';
import { adminBotModule } from './bots/adminBot.js';

const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/', productRoute)

const token = process.env.PUBLIC_BOT;
const tokenAdmin = process.env.ADMIN_BOT;

const webAppUrl = 'https://pr-tg-app.vercel.app/';

const bot = new TelegramBot(token, { polling: true });
export const adminBot = new TelegramBot(tokenAdmin, { polling: true });


adminBotModule(adminBot)
telegramBotModule(bot, webAppUrl, adminBot)

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});