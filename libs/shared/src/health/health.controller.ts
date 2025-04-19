// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { MikroORM } from '@mikro-orm/core';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly orm: MikroORM,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    try {
      // 检查数据库连接状态
      const isConnected = await this.orm.isConnected();
      
      return {
        status: isConnected ? 'ok' : 'down',
        details: {
          database: {
            status: isConnected ? 'connected' : 'disconnected',
            ping: await this.checkDatabaseLatency(),
          }
        }
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async checkDatabaseLatency(): Promise<number> {
    const start = Date.now();
    await this.orm.em.getConnection().execute('SELECT 1');
    return Date.now() - start;
  }
}