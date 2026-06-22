import { Module } from '@nestjs/common';
import { LoginLogsController } from './login-logs.controller';
import { LoginLogsService } from './login-logs.service';

@Module({
  controllers: [LoginLogsController],
  providers: [LoginLogsService],
  exports: [LoginLogsService], // Exported so AuthService can write login logs
})
export class LoginLogsModule {}
