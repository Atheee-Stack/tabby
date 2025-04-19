// src/database/database.service.ts
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { MikroORM, Connection } from '@mikro-orm/core';
import { ConfigService } from '@taddy/shared-lib';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private retryCount = 0;
  private retryTimer: NodeJS.Timeout;

  constructor(
    private readonly orm: MikroORM,
    private readonly config: ConfigService,
  ) {}

  async connectWithRetry(): Promise<Connection> {
    try {
      await this.orm.connect();
      this.retryCount = 0;
      return this.orm.em.getConnection();
    } catch (error) {
      if (this.retryCount < this.config.mikroOrmConfig.maxRetries) {
        this.retryCount++;
        Logger.warn(`Connection attempt ${this.retryCount} failed, retrying in ${this.config.mikroOrmConfig.retryDelay}ms`);
        
        await new Promise(resolve => 
          setTimeout(resolve, this.config.mikroOrmConfig.retryDelay)
        );
        
        return this.connectWithRetry();
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Database connection failed after ${this.retryCount} attempts: ${errorMessage}`);
    }
  }

  async onApplicationShutdown() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    await this.orm.close();
  }
}