// src/alert/alert.module.ts
import { Module } from '@nestjs/common';
import { AlertService } from './alert.service.js';
import { ConfigModule } from '../config/env/config.module.js';

@Module({
  imports: [ConfigModule],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}