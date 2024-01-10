import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
});

async function connectToDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL');
        await sequelize.sync();
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    }
}

export { sequelize, connectToDatabase };
