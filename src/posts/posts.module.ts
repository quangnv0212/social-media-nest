import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { Post, PostSchema } from './schemas/post.schema';
import { PostInteraction } from './schemas/post-interaction.schema';
import { PostInteractionSchema } from './schemas/post-interaction.schema';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { postMulterConfig } from '../config/post-multer.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostInteraction.name, schema: PostInteractionSchema },
    ]),
    MulterModule.register(postMulterConfig),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
