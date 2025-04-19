// config/core.config.ts

import { MongoAuthMechanism, MongoReadPreference, MongoWriteConcern } from "../enums/mongo.enum";

export interface MikroORMConfig {
  clientUrl: string;
  dbName: string;
  auth: {
    username: string;
    password: string;
    mechanism: MongoAuthMechanism;
  };
  tls: boolean;
  tlsCAFile?: string;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
  readPreference: MongoReadPreference;
  writeConcern: MongoWriteConcern;

  connectionTimeout: number; // 连接超时时间（毫秒）
  socketTimeout: number;     // 单次操作超时
  maxRetries: number;       // 最大重试次数
  retryDelay: number;       // 重试间隔
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  mikroORM: MikroORMConfig;
}