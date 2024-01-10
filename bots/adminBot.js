import { Product } from '../db/models/product.js';
import { uploadFileToS3AndGetUrl } from '../storage/s3Uploader.js'

export const adminBotModule = (adminBot) => {

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
} 
