import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import { s3Client } from './connect.js'; 

const uploadFileToS3AndGetUrl = async (file) => {
    const bucket = process.env.AWS_BUCKET;
    
    const timestamp = Date.now();
    const keyFile = `image_${timestamp}.jpg`;

    const params = {
        Bucket: bucket,
        Key: keyFile,
        Body: file,
        ContentType: 'image/jpg',
        ACL: 'public-read', 
    };

    const uploadCommand = new PutObjectCommand(params);

    try {
        const data = await s3Client.send(uploadCommand);
        const objectUrl = `https://${bucket}.s3.${'eu-north-1'}.amazonaws.com/${keyFile}`;
        console.log('Object URL:', objectUrl);
        return objectUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export { uploadFileToS3AndGetUrl };
