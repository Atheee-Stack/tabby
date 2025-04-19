// src/database/database.monitor.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { AlertService, assertIsError } from '@taddy/shared-lib';

@Injectable()
export class DatabaseMonitor implements OnModuleInit {
  private monitoring = false;

  constructor(
    private readonly orm: MikroORM,
    private readonly alertService: AlertService,
  ) {}

  onModuleInit() {
    this.startConnectionMonitor();
  }

  private async handleConnectionCheck() {
    try {
      if (!this.orm.isConnected()) {
        await this.orm.connect();
        this.alertService.sendRecoveryAlert();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.alertService.sendCriticalAlert({
          type: 'DATABASE_DOWN',
          message: `Database connection lost: ${error.message}`,
          timestamp: new Date(),
        });
      } else {
        this.alertService.sendCriticalAlert({
          type: 'DATABASE_DOWN',
          message: 'Unknown database connection error',
          timestamp: new Date(),
        });
      }
    }
  }

  private startConnectionMonitor() {
    setInterval(async () => {
      try {
        if (!this.orm.isConnected()) {
          await this.orm.connect();
          this.alertService.sendRecoveryAlert();
        }
      } catch (error) {
        assertIsError(error);
        this.alertService.sendCriticalAlert({
          type: 'DATABASE_DOWN',
          message: `Database connection lost: ${error.message}`,
          timestamp: new Date(),
        });
      }
    }, 5000); // 每5秒检查一次
  }
}