import { diskStorage } from 'multer';
import { extname } from 'path';

export const postMulterConfig = {
  storage: diskStorage({
    destination: './uploads/posts',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
};
