import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: express.Request) {
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.register(dto, ip, userAgent);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: express.Request) {
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(dto, 'user', ip, userAgent);
  }
}
