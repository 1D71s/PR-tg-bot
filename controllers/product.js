import axios from 'axios';
import { Product } from '../db/models/product.js';

export const getProducts = async (res) => {
    const products = await Product.findAll();

    const productData = products.map(product => product.dataValues);

    res.json(productData)
} 