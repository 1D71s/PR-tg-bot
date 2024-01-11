export const telegramBotModule = (bot, webAppUrl, adminBot) => {
    
    bot.on('message', async (msg) => {
        const adminId = [625210390];
    
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
            adminBot.sendMessage(adminId[0], `Нове замовлення від користувача ${userId}: ${text}`);
        }
    });
} 
