const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const { connectToDatabase } = require('./db/db');
const { Product } = require('./db/models');
const fs = require('fs');


const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

const token = process.env.PUBLIC_BOT;
const tokenAdmin = process.env.ADMIN_BOT;

const webAppUrl = 'https://pr-tg-app.vercel.app/';

const bot = new TelegramBot(token, { polling: true });
const adminBot = new TelegramBot(tokenAdmin, { polling: true });

adminBot.setMyCommands([
    { command: '/start', description: 'Початок' },
    { command: '/product', description: 'Додати позицію' },
    { command: '/order', description: 'Замовлення' },
]);


const userStates = {};

adminBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/product') {
        userStates[chatId] = {
            step: 'name',
            data: {}
        };
        await adminBot.sendMessage(chatId, 'Введите название товара:');
    } else if (userStates[chatId] && userStates[chatId].step) {
        try {
            if (userStates[chatId].step === 'name') {
                userStates[chatId].data.name = text;
                userStates[chatId].step = 'description';
                await adminBot.sendMessage(chatId, 'Введите описание товара:');
            } else if (userStates[chatId].step === 'description') {
                userStates[chatId].data.description = text;
                userStates[chatId].step = 'image';
                await adminBot.sendMessage(chatId, 'Отправьте изображение товара:');
            } else if (userStates[chatId].step === 'image' && msg.photo) {
                const fileId = msg.photo[3].file_id;
                const file = await adminBot.getFile(fileId);

                const uploadFolderPath = './uploads/';

                if (!fs.existsSync(uploadFolderPath)) {
                    fs.mkdirSync(uploadFolderPath);
                }

                const fileName = `image_${Date.now()}.jpg`;

                const filePath = `${uploadFolderPath}${fileName}`;

                const imageStream = adminBot.getFileStream(fileId);
                const writeStream = fs.createWriteStream(filePath);
                imageStream.pipe(writeStream);

                userStates[chatId].data.image = filePath;

                userStates[chatId].step = 'price';
                await adminBot.sendMessage(chatId, 'Введите цену товара:');

            } else if (userStates[chatId].step === 'price') {
                userStates[chatId].data.price = parseFloat(text);

                await Product.create(userStates[chatId].data);

                await adminBot.sendMessage(chatId, 'Продукт успешно создан!');
                delete userStates[chatId];
            }
        } catch (err) {
            console.error('Error creating product:', err);
            await adminBot.sendMessage(chatId, 'Произошла ошибка при создании продукта. Пожалуйста, попробуйте еще раз.');
            delete userStates[chatId];
        }
    }
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

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});