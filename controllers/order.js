import axios from 'axios';
import { Order, OrderProduct } from '../db/models/order.js'

export const createOrder = async (req, res, adminBot, bot, adminId) => {
    try {
        const { name, phone, time, address, basket, user } = req.body;

        if (!name || !phone || !basket || basket.length === 0) {
            return res.status(400).json({ error: 'Invalid order data' });
        }
        const order = await Order.create({
            clientName: name,
            take: address ? 'delivery' : 'take',
            time,
            address: address ? address : 'PR',
            number: phone,
        });

        await Promise.all(basket.map(async (product) => {
            await OrderProduct.create({
                orderId: order.id,
                productId: product.id,
                count: product.quantity,
            });
        }));

        let message = `Номер замовлення: ${order.id}\nІм'я клієнта: ${name}\nМісце отримання: ${address ? address : order.take}\nЧас: ${time}\nНомер телефону: ${order.number}\nЗамовленно:`;

        basket.forEach((product) => {
            message += `\n- ${product.name} - ${product.quantity} шт.`;
        });

        await adminBot.sendMessage(adminId[0], message);


        const userMessage = 'Ваше замовлення відправлено!\n\nОчікуйте на підтвердження.';
        await bot.sendMessage(user.id, `${userMessage} \n\n${message}`);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
