import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import * as express from 'express';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: express.Request) {
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(dto, 'admin', ip, userAgent);
  }
}
