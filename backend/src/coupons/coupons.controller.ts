import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ClaimCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  // --- Public Storefront endpoint ---
  @Get('code/:code')
  async getCouponByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  // --- Authenticated User endpoints ---
  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claim(
    @CurrentUser() user: { id: number },
    @Body() dto: ClaimCouponDto,
  ) {
    return this.couponsService.claim(user.id, dto.code);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyCoupons(@CurrentUser() user: { id: number }) {
    return this.couponsService.findMyCoupons(user.id);
  }

  // --- Administrative CRUD endpoints ---
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.couponsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(id);
  }
}
