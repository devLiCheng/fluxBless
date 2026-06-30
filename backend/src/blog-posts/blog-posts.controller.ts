import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto, UpdateBlogPostDto, BlogPostQueryDto } from './dto/blog-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('blog-posts')
export class BlogPostsController {
  constructor(private blogPostsService: BlogPostsService) {}

  @Get()
  findAll(@Query() query: BlogPostQueryDto) {
    return this.blogPostsService.findAll(query);
  }

  @Get('by-slug/:slug')
  findOneBySlug(@Param('slug') slug: string, @Query('isAdmin') isAdmin?: string) {
    return this.blogPostsService.findOneBySlug(slug, isAdmin === 'true');
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.blogPostsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogPostsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlogPostDto) {
    return this.blogPostsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogPostsService.remove(id);
  }
}
