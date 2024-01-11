import { Product } from '../../../db/models/product.js';

export const getAllProducts = async (chat, adminBot) => {
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
                    [
                        { text: 'Видалити', callback_data: `delete_product_${product.id}` },
                        { text: 'Змінити ціну', callback_data: `change_price_${product.id}` },
                    ]
                ]
            };
        
            await adminBot.sendPhoto(chat, product.image, { caption: messageText, reply_markup: inlineKeyboard });
        }
        
    } catch (error) {
        await adminBot.sendMessage(chat, 'Error fetching products. Please try again later.');
    }
}