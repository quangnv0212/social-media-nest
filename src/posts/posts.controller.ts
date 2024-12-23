import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { postMulterConfig } from '../config/post-multer.config';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('media', 10, postMulterConfig))
  async create(
    @Request() req,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postsService.create(req.user.userId, createPostDto, files);
  }

  @Post('dummy')
  async createDummyPosts(@Request() req) {
    const post = await this.postsService.createDummyPosts(req.user.userId);
    return {
      status: HttpStatus.CREATED,
      message: 'Dummy posts created successfully',
      data: post,
    };
  }

  @Get()
  findAll(
    @Query('query') query: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.postsService.findAll(query, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, req.user.userId, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(id, req.user.userId);
  }

  @Post('like')
  async likePost(@Body() body: { postId: string }, @Request() req) {
    return this.postsService.handleInteraction(
      body.postId,
      req.user.userId,
      'like',
    );
  }
  @Get('get-likes-post')
  async getLikesPosts(@Query('id') id: string, @Request() req) {
    return this.postsService.checkUserInteraction(id, req.user.userId, 'like');
  }

  @Get('interactions')
  async getInteractions(@Query('id') id: string, @Request() req) {
    const [isLiked, isShared, isBookmarked] = await Promise.all([
      this.postsService.checkUserInteraction(id, req.user.userId, 'like'),
      this.postsService.checkUserInteraction(id, req.user.userId, 'share'),
      this.postsService.checkUserInteraction(id, req.user.userId, 'bookmark'),
    ]);

    return {
      isLiked,
      isShared,
      isBookmarked,
    };
  }

  @Get(':id/likes')
  async getPostLikes(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getPostLikes(id, page, limit);
  }
}
