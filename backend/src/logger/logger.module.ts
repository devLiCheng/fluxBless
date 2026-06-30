import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController, LoggerPageviewController } from './logger.controller';

@Module({
  controllers: [LoggerController, LoggerPageviewController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
