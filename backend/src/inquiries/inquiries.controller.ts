import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe, Req
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as express from 'express';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inquiries')
export class InquiriesController {
  constructor(
    private inquiriesService: InquiriesService,
    private jwtService: JwtService,
  ) {}

  @Post()
  async create(@Body() dto: CreateInquiryDto, @Req() req: express.Request) {
    let userId: number | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = this.jwtService.decode(token) as any;
        if (payload && payload.sub) {
          userId = payload.sub;
        }
      } catch (err) {
        // Ignore parsing errors for optional association
      }
    }
    return this.inquiriesService.create(dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.inquiriesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInquiryStatusDto,
  ) {
    return this.inquiriesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.remove(id);
  }
}
