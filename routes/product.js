import { Router } from 'express';
import { getImage } from '../controllers/product.js'

const router = new Router()

router.get('/getImage', getImage)

export { router }