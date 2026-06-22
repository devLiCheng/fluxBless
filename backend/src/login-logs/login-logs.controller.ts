import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LoginLogsService } from './login-logs.service';

@Controller('login-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class LoginLogsController {
  constructor(private loginLogsService: LoginLogsService) {}

  @Get()
  async getLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.loginLogsService.findAll(page, limit);
  }
}
