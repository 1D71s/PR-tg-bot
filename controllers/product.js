import axios from 'axios';
import { Product } from '../db/models/product.js';

export async function test(res) {
    try {
        const s3Url = 'https://pr-tg-bot.s3.eu-north-1.amazonaws.com/image_1704908429336.jpg';
    
        const response = await axios.get(s3Url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
    
        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching image from S3:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const getProducts = async (res) => {
    const products = await Product.findAll();

    const productData = products.map(product => product.dataValues);

    res.json(productData)
} 