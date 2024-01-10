import { uploadFileToS3AndGetUrl } from '../storage/s3Uploader.js'
import axios from 'axios';

export const getImage = async (req, res) => {
    try {
        const s3Url = 'https://pr-tg-bot.s3.eu-north-1.amazonaws.com/photo_2024-01-03_14-02-13.jpg';
    
        const response = await axios.get(s3Url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
    
        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching image from S3:', error);
        res.status(500).send('Internal Server Error');
    }
}