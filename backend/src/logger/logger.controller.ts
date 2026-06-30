import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('logs')
export class LoggerController {
  constructor(private loggerService: LoggerService) {}

  // Public endpoint for client-side crash/telemetry reporting
  @Post('client')
  async logClientEvent(
    @Body() body: {
      level: string;
      message: string;
      url?: string;
      userAgent?: string;
      stack?: string;
    },
  ) {
    return this.loggerService.logClientEvent(body);
  }

  // Admin-only endpoint to view logs
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('level') level?: string,
  ) {
    return this.loggerService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      level,
    );
  }
}

@Controller('logger')
export class LoggerPageviewController {
  constructor(private loggerService: LoggerService) {}

  @Post('pageview')
  async logPageView(
    @Body() body: {
      path: string;
      referrer?: string;
      screenSize?: string;
    },
  ) {
    return this.loggerService.logPageView(body);
  }
}
