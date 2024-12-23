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
    if (!file.originalname.match(/\.(JPG|JPEG|PNG|GIF|MP4|MOV|AVI)$/)) {
      return callback(
        new Error('Only image and video files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
};
