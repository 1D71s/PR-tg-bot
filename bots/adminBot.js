import { Product } from '../db/models/product.js';
import { uploadFileToS3AndGetUrl } from '../storage/s3Uploader.js'

export const adminBotModule = (adminBot) => {

    adminBot.setMyCommands([
        { command: '/start', description: 'Початок' },
        { command: '/products', description: 'Позиції' },
        { command: '/add', description: 'Додати позицію' },
        { command: '/orders', description: 'Замовлення' },
    ]);

    const getAllProducts = async (chat) => {
        try {
            const products = await Product.findAll();

            const productData = products.map(product => product.dataValues);

            for (const product of productData) {
                const messageText = `
                    ID: ${product.id}
                    Позиція: ${product.name}
                    Опис: ${product.description}
                    Ціна: ${product.price} ГРН
                `;
            
                const inlineKeyboard = {
                    inline_keyboard: [
                        [{ text: 'Видалити позицію', callback_data: `delete_product_${product.id}` }]
                    ]
                };
            
                await adminBot.sendPhoto(chat, product.image, { caption: messageText, reply_markup: inlineKeyboard });
            }
            
        } catch (error) {
            await adminBot.sendMessage(chatId, 'Error fetching products. Please try again later.');
        }
    }
    
    const userStates = {};
    
    adminBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text == '/products') {
            getAllProducts(chatId)
        }
    
        if (text === '/add') {
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
                    const streamToBuffer = async (stream) => {
                        return new Promise((resolve, reject) => {
                            const chunks = [];
                            stream.on('data', (chunk) => chunks.push(chunk));
                            stream.on('end', () => resolve(Buffer.concat(chunks)));
                            stream.on('error', (error) => reject(error));
                        });
                    };

                    const fileId = msg.photo[2].file_id;

                    const imageBuffer = await streamToBuffer(adminBot.getFileStream(fileId));

                    const image = await uploadFileToS3AndGetUrl(imageBuffer);

                    userStates[chatId].data.image = image;
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

    adminBot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
    
        if (data.startsWith('delete_product_')) {
            const productId = parseInt(data.replace('delete_product_', ''), 10);
            
            await Product.destroy({
                where: { id: productId }
            });
    
            await adminBot.sendMessage(chatId, `Продукт с ID ${productId} видалено.`);
            getAllProducts(chatId)
        }
    });
} 
