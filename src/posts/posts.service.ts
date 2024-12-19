import { faker } from '@faker-js/faker/locale/en';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostInteraction } from './schemas/post-interaction.schema';
import { Post } from './schemas/post.schema';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(PostInteraction.name)
    private interactionModel: Model<PostInteraction>,
  ) {}

  async create(userId: Types.ObjectId, createPostDto: CreatePostDto) {
    const post = await this.postModel.create({
      ...createPostDto,
      userId,
    });
    return post;
  }
  async createDummyPosts(userId: Types.ObjectId) {
    const postContent = {
      content: `This is a dummy post ${faker.lorem.sentence()}`,
      userId,
    };
    const post = await this.postModel.create(postContent);
    return post;
  }

  async findAll(query: string, page = 1, limit = 10) {
    const { filter, sort, projection, population } = aqp(query);
    delete filter.currentPage;
    delete filter.pageSize;
    const skip = (page - 1) * limit;
    const posts = await this.postModel
      .find(filter)
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .select(projection)
      .select('+recentLikes +recentShares +recentBookmarks')
      .populate('userId', 'name avatar')
      .populate('recentLikes.userId', 'name avatar')
      .populate('recentShares.userId', 'name avatar')
      .populate('recentBookmarks.userId', 'name avatar')
      .exec();

    const total = await this.postModel.countDocuments();

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .select('+recentLikes +recentShares +recentBookmarks')
      .populate('userId', 'name avatar')
      .populate('recentLikes.userId', 'name avatar')
      .populate('recentShares.userId', 'name avatar')
      .populate('recentBookmarks.userId', 'name avatar');

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(
    id: string,
    userId: Types.ObjectId,
    updatePostDto: UpdatePostDto,
  ) {
    const post = await this.postModel.findOneAndUpdate(
      { _id: id, userId },
      updatePostDto,
      { new: true },
    );
    if (!post) {
      throw new NotFoundException('Post not found or unauthorized');
    }
    return post;
  }

  async remove(id: string, userId: Types.ObjectId) {
    const post = await this.postModel.findOneAndDelete({ _id: id, userId });
    if (!post) {
      throw new NotFoundException('Post not found or unauthorized');
    }
    return { message: 'Post deleted successfully' };
  }

  async handleInteraction(
    postId: string,
    userId: Types.ObjectId,
    type: 'like' | 'share' | 'bookmark',
  ) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingInteraction = await this.interactionModel.findOne({
      postId,
      userId,
      type,
    });

    if (existingInteraction) {
      // Remove interaction
      await existingInteraction.deleteOne();
      await this.updateInteractionCount(postId, type, -1);

      // Remove from recent interactions
      const recentField = `recent${type.charAt(0).toUpperCase() + type.slice(1)}s`;
      await this.postModel.updateOne(
        { _id: postId },
        {
          $pull: { [recentField]: { userId } },
        },
      );

      return { message: `${type} removed` };
    } else {
      // Add interaction
      await this.interactionModel.create({
        postId,
        userId,
        type,
      });
      await this.updateInteractionCount(postId, type, 1);

      // Add to recent interactions (keep only last 5)
      const recentField = `recent${type.charAt(0).toUpperCase() + type.slice(1)}s`;
      await this.postModel.updateOne(
        { _id: postId },
        {
          $push: {
            [recentField]: {
              $each: [{ userId, createdAt: new Date() }],
              $slice: -5, // Keep only the 5 most recent
            },
          },
        },
      );

      return { message: `${type} added` };
    }
  }

  private async updateInteractionCount(
    postId: string,
    type: 'like' | 'share' | 'bookmark',
    increment: number,
  ) {
    const update = {};
    update[`${type}sCount`] = increment;

    await this.postModel.findByIdAndUpdate(
      postId,
      { $inc: update },
      { new: true },
    );
  }

  async checkUserInteraction(
    postId: string,
    userId: Types.ObjectId,
    type: 'like' | 'share' | 'bookmark',
  ) {
    const interaction = await this.interactionModel.findOne({
      postId,
      userId,
      type,
    });
    return !!interaction;
  }

  async getPostLikes(postId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      this.interactionModel
        .find({ postId, type: 'like' })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.interactionModel.countDocuments({ postId, type: 'like' }),
    ]);

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: Math.ceil(total / limit),
        total,
      },
      result: likes,
    };
  }
}
