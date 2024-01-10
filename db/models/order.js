import { DataTypes } from 'sequelize';
import { sequelize } from '../connect.js';

const Order = sequelize.define('Product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    productId: { type: DataTypes.STRING },
    count: { type: DataTypes.INTEGER },
    clientName: { type: DataTypes.STRING },
    take: {type: DataTypes.STRING},
    time: { type: DataTypes.DATE },
    addres: {type: DataTypes.STRING},
});

export { Order }