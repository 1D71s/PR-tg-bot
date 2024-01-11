import { Product } from '../../db/models/product.js';
import { uploadFileToS3AndGetUrl } from '../../storage/s3Uploader.js';
import { getAllProducts } from './services/getAllProduct.js';
import { setBotCommands } from './services/botCommands.js';
import { streamToBuffer } from './services/streamToBuffer.js'

export const adminBotModule = (adminBot) => {
    const userStates = {};

    setBotCommands(adminBot);

    const sendMessage = async (chatId, text) => {
        await adminBot.sendMessage(chatId, text);
    };

    const handleAddProduct = async (chatId) => {
        userStates[chatId] = { step: 'name', data: {} };
        await sendMessage(chatId, 'Введіть назву товару:');
    };

    const handleProductCreation = async (chatId, text, msg) => {
        try {
            const state = userStates[chatId];

            switch (state.step) {
                case 'name':
                    state.data.name = text;
                    state.step = 'description';
                    await sendMessage(chatId, 'Введіть опис товару:');
                    break;

                case 'description':
                    state.data.description = text;
                    state.step = 'image';
                    await sendMessage(chatId, 'Надішліть зображення товару:');
                    break;

                case 'image':
                    if (msg.photo) {
                        const fileId = msg.photo[2].file_id;
                        const imageBuffer = await streamToBuffer(adminBot.getFileStream(fileId));
                        const image = await uploadFileToS3AndGetUrl(imageBuffer);
                        state.data.image = image;
                        state.step = 'price';
                        await sendMessage(chatId, 'Введіть ціну товару:');
                    }
                    break;

                case 'price':
                    state.data.price = parseFloat(text);
                    await Product.create(state.data);
                    await sendMessage(chatId, 'Продукт успішно створено!');
                    delete userStates[chatId];
                    break;
            }
        } catch (err) {
            handleError(chatId, err, 'Помилка при створенні продукту.');
        }
    };

    const handleError = async (chatId, err, errorMessage) => {
        console.error(`${errorMessage}:`, err);
        await sendMessage(chatId, `${errorMessage} Будь ласка, спробуйте ще раз.`);
        delete userStates[chatId];
    };

    adminBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text == '/products') {
            getAllProducts(chatId, adminBot);
        }

        if (text === '/add') {
            handleAddProduct(chatId);
        } else if (userStates[chatId] && userStates[chatId].step) {
            await handleProductCreation(chatId, text, msg);
        }

        if (userStates[chatId] && userStates[chatId].step === 'change_price') {
            handlePriceChange(chatId, text);
        }
    });

    const handlePriceChange = async (chatId, text) => {
        try {
            const newPrice = parseFloat(text);
            const productId = userStates[chatId].data.productId;

            await Product.update({ price: newPrice }, { where: { id: productId } });

            await sendMessage(chatId, `Ціна товару успішно змінена на ${newPrice} ГРН.`);
            getAllProducts(chatId, adminBot);
            delete userStates[chatId];
        } catch (err) {
            handleError(chatId, err, 'Помилка при оновленні ціни продукту.');
        }
    };

    adminBot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        if (data.startsWith('delete_product_')) {
            handleProductDeletion(chatId, data);
        } else if (data.startsWith('change_price_')) {
            handlePriceChangeRequest(chatId, data);
        }
    });

    const handleProductDeletion = async (chatId, data) => {
        try {
            const productId = parseInt(data.replace('delete_product_', ''), 10);
            await Product.destroy({ where: { id: productId } });

            await sendMessage(chatId, `Продукт з ID ${productId} видалено.`);
            getAllProducts(chatId, adminBot);
        } catch (err) {
            handleError(chatId, err, 'Помилка при видаленні продукту.');
        }
    };

    const handlePriceChangeRequest = async (chatId, data) => {
        const productId = parseInt(data.replace('change_price_', ''), 10);

        userStates[chatId] = { step: 'change_price', data: { productId } };

        await sendMessage(chatId, 'Введите новую цену для товара:');
    };
};
