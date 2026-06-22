import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { IsInt, IsString, Min, Max, Length } from 'class-validator';

class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @Length(1, 1000)
  comment: string;
}

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: { id: number },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(productId, user.id, dto.rating, dto.comment);
  }

  @Get()
  async getReviews(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findByProduct(productId);
  }
}
