import { v2 as cloudinary } from 'cloudinary';
import Configs from './configs/index.configs.js';

cloudinary.config({
    cloud_name: Configs.CLOUDINARY_NAME,
    api_key: Configs.CLOUDINARY_API_KEY,
    api_secret: Configs.CLOUDINARY_API_SECRET
});

export default cloudinary;