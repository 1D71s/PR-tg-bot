export const setBotCommands = (adminBot) => {
    adminBot.setMyCommands([
        { command: '/start', description: 'Початок' },
        { command: '/products', description: 'Позиції' },
        { command: '/add', description: 'Додати позицію' },
        { command: '/orders', description: 'Замовлення' },
    ]);
};
