import { DataTypes } from 'sequelize';
import { sequelize } from '../connect.js';

const Product = sequelize.define('Product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    name: { type: DataTypes.STRING },
    image: {type: DataTypes.STRING, unique: true},
    description: {type: DataTypes.STRING},
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
});

export { Product }