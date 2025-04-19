// config/env/config.service.ts
import { Injectable } from '@nestjs/common';
import { AppConfig, MikroORMConfig } from '../core.config.js';
import { config } from './schemas/config.schema.js'; // Zod生成的配置对象
import { MongoAuthMechanism, MongoReadPreference, MongoWriteConcern } from '../../enums/mongo.enum.js';
import * as fs from 'fs';

@Injectable()
export class ConfigService {
  generateConfigDoc(): string {
    return `
      Application Configuration:
      Environment: ${this.appConfig.nodeEnv}
      Port: ${this.port}
      MongoDB:
        URL: ${this.mikroOrmConfig.clientUrl}
        Database: ${this.mikroOrmConfig.dbName}
        Auth: ${this.mikroOrmConfig.auth.mechanism}
        TLS: ${this.mikroOrmConfig.tls ? 'Enabled' : 'Disabled'}
    `;
  }
  private readonly appConfig: AppConfig;

  constructor() {
    this.appConfig = this.validateConfig();
    [
      this.validateEnvironmentRules,
      this.validateCredentials,
      this.validateMongoURL,
      this.validateCertificates
    ].forEach(validator => validator.call(this));
  }

  private validateConfig(): AppConfig {
    return {
      nodeEnv: config.NODE_ENV,
      port: config.PORT,
      mikroORM: {
        clientUrl: config.MONGO_CLIENT_URL_DEVELOPMENT,
        dbName: config.MONGO_DB_NAME_DEVELOPMENT,
        auth: {
          username: config.MONGO_USERNAME,
          password: config.MONGO_PASSWORD,
          mechanism: config.MONGO_AUTH_MECHANISM as MongoAuthMechanism,
        },
        tls: config.MONGO_TLS_ENABLED,
        tlsCAFile: config.MONGO_TLS_CA_FILE, 
        pool: {
          min: config.MONGO_POOL_MIN,
          max: config.MONGO_POOL_MAX,
          idleTimeoutMillis: config.MONGO_IDLE_TIMEOUT_MS,
        },
        readPreference: config.MONGO_READ_PREFERENCE as MongoReadPreference,
        writeConcern: config.MONGO_WRITE_CONCERN as MongoWriteConcern
    }
    };
  }

  private validateEnvironmentRules(): void {
    const errors: string[] = [];

    // 1. 生产环境强制验证
    if (this.isProduction) {
      if (this.appConfig.mikroORM.dbName === 'myapp_dev') {
        errors.push('Production database name cannot use development default');
      }

      if (this.appConfig.mikroORM.clientUrl.includes('localhost')) {
        errors.push('Production MongoDB URL cannot point to localhost');
      }

      if (!this.appConfig.mikroORM.tls) {
        errors.push('TLS must be enabled in production');
      }

      if (this.appConfig.mikroORM.auth.username === 'dev_user') {
        errors.push('Production username cannot use development default');
      }
    }

    // 2. 连接池验证
    if (this.appConfig.mikroORM.pool.min > this.appConfig.mikroORM.pool.max) {
      errors.push(`Connection pool min (${this.appConfig.mikroORM.pool.min}) 
        cannot exceed max (${this.appConfig.mikroORM.pool.max})`);
    }

    // 3. 超时时间验证
    if (this.appConfig.mikroORM.pool.idleTimeoutMillis < 10000) {
      errors.push('Idle timeout should be at least 10 seconds');
    }

    // 4. 读写策略验证
    if (this.isProduction && 
        this.appConfig.mikroORM.readPreference === MongoReadPreference.PRIMARY) {
      errors.push('Avoid using primary read preference in production');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n• ')}`);
    }
  }
  private validateCredentials(): void {
    const weakPasswords = ['password', '123456', 'admin'];
    if (weakPasswords.includes(this.appConfig.mikroORM.auth.password)) {
      throw new Error('Password does not meet security requirements');
    }
  }
  private validateMongoURL(): void {
    const isLocalhost = this.appConfig.mikroORM.clientUrl.includes('localhost');
    if (this.isProduction && isLocalhost) {
      throw new Error('Production database cannot use localhost');
    }
    
    if (!this.appConfig.mikroORM.clientUrl.startsWith('mongodb')) {
      throw new Error('Invalid MongoDB connection scheme');
    }
  }
  private validateCertificates(): void {
    if (this.appConfig.mikroORM.tlsCAFile) {
      try {
        const stats = fs.statSync(this.appConfig.mikroORM.tlsCAFile);
        if (!stats.isFile()) {
          throw new Error('TLS CA file not found');
        }
      } catch (e) {
        throw new Error(`TLS CA file validation failed: ${e as Error}.message}`);
      }
    }
  }

  // 新增方法：获取完整配置（调试用）
  get fullConfig(): AppConfig {
    return JSON.parse(JSON.stringify(this.appConfig)); // 返回深拷贝
  }


  get mikroOrmConfig(): MikroORMConfig {
    return this.appConfig.mikroORM;
  }

  get port(): number {
    return this.appConfig.port;
  }

  get isProduction(): boolean {
    return this.appConfig.nodeEnv === 'production';
  }
}