import { DataTypes } from 'sequelize';
import { sequelize } from '../connect.js';

const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true },
    clientName: { type: DataTypes.STRING },
    take: { type: DataTypes.STRING },
    time: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    number: { type: DataTypes.STRING },
});

const OrderProduct = sequelize.define('OrderProduct', {
    id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER },
    count: { type: DataTypes.INTEGER },
});

Order.belongsToMany(OrderProduct, { through: 'OrderProducts1', as: 'OrderProducts' });
OrderProduct.belongsTo(Order);

sequelize.sync();

export { Order, OrderProduct };