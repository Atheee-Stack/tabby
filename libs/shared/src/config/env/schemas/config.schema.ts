// config.schema.ts
import { z } from "zod";
import { Environment, EnvKeys as BaseEnvKeys } from "../../../enums/environment.enum.js";
import {
  EnvKeys as ConfigEnvKeys,
  MongoAuthMechanism,
  MongoTLS,
  MongoReadPreference,
  MongoWriteConcern,
} from "../../../enums/mongo.enum.js";

// 基础配置验证
const BaseSchema = z.object({
  [BaseEnvKeys.NODE_ENV]: z.nativeEnum(Environment).default(Environment.Development),
  [BaseEnvKeys.PORT]: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),
});

// MongoDB 配置验证
const MongoSchema = z.object({
  // 开发环境默认配置
  [ConfigEnvKeys.MONGO_DB_NAME_DEVELOPMENT]: z.string()
    .default(process.env["NODE_ENV"] === Environment.Production 
      ? ''  // 生产环境必须显式指定
      : 'myapp_dev'
    )
    .refine(val => process.env["NODE_ENV"] !== Environment.Production || val !== '', {
      message: "MONGO_DB_NAME_DEVELOPMENT is required in production"
    }),

  [ConfigEnvKeys.MONGO_CLIENT_URL_DEVELOPMENT]: z.string()
    .url()
    .default(process.env["NODE_ENV"] === Environment.Production 
      ? '' 
      : 'mongodb://localhost:27017'
    )
    .refine(val => process.env["NODE_ENV"] !== Environment.Production || val !== '', {
      message: "MONGO_CLIENT_URL_DEVELOPMENT is required in production"
    }),

  // 认证配置（生产环境必须显式设置）
  [ConfigEnvKeys.MONGO_USERNAME]: z.string()
    .min(1)
    .default(process.env["NODE_ENV"] === Environment.Production ? '' : 'dev_user')
    .refine(val => process.env["NODE_ENV"] !== Environment.Production || val !== '', {
      message: "MONGO_USERNAME is required in production"
    }),

  [ConfigEnvKeys.MONGO_PASSWORD]: z.string()
    .min(1)
    .default(process.env["NODE_ENV"] === Environment.Production ? '' : 'dev_pass')
    .refine(val => process.env["NODE_ENV"] !== Environment.Production || val !== '', {
      message: "MONGO_PASSWORD is required in production"
    }),

  // 安全配置默认值
  [ConfigEnvKeys.MONGO_AUTH_MECHANISM]: z.nativeEnum(MongoAuthMechanism)
    .default(MongoAuthMechanism.SCRAM_SHA_256),

  [ConfigEnvKeys.MONGO_TLS_ENABLED]: z
    .enum([MongoTLS.ENABLED, MongoTLS.DISABLED])
    .default(process.env["NODE_ENV"] === Environment.Production 
      ? MongoTLS.ENABLED 
      : MongoTLS.DISABLED
    )
    .transform(val => val === MongoTLS.ENABLED),

  // TLS 配置（生产环境需要证书）
  [ConfigEnvKeys.MONGO_TLS_CA_FILE]: z.string()
    .optional()
    .default(process.env["NODE_ENV"] === Environment.Production 
      ? '/etc/ssl/certs/ca.pem' 
      : './certs/ca.pem'
    )
    .transform(path => {
      if (path && !path.startsWith('/')) {
        return require('path').resolve(__dirname, path)
      }
      return path
    }),

  // 连接池智能默认值
  [ConfigEnvKeys.MONGO_POOL_MIN]: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(process.env["NODE_ENV"] === Environment.Production ? 10 : 5),

  [ConfigEnvKeys.MONGO_POOL_MAX]: z.coerce
    .number()
    .int()
    .positive()
    .default(process.env["NODE_ENV"] === Environment.Production ? 50 : 30),

  [ConfigEnvKeys.MONGO_IDLE_TIMEOUT_MS]: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(process.env["NODE_ENV"] === Environment.Production ? 60000 : 30000),

  // 读写策略默认值
  [ConfigEnvKeys.MONGO_READ_PREFERENCE]: z.nativeEnum(MongoReadPreference)
    .default(process.env["NODE_ENV"] === Environment.Production 
      ? MongoReadPreference.SECONDARY_PREFERRED 
      : MongoReadPreference.PRIMARY
    ),

  [ConfigEnvKeys.MONGO_WRITE_CONCERN]: z.nativeEnum(MongoWriteConcern)
    .default(process.env["NODE_ENV"] === Environment.Production 
      ? MongoWriteConcern.MAJORITY 
      : MongoWriteConcern.ACKNOWLEDGED
    ),

    [ConfigEnvKeys.MONGO_CONN_TIMEOUT]: z.coerce.number().default(5000),
    [ConfigEnvKeys.MONGO_SOCKET_TIMEOUT]: z.coerce.number().default(30000),
    [ConfigEnvKeys.MONGO_MAX_RETRIES]: z.coerce.number().default(3),
    [ConfigEnvKeys.MONGO_RETRY_DELAY]: z.coerce.number().default(1000),
});

// 合并所有配置 Schema
const FullSchema = BaseSchema.merge(MongoSchema);

// 类型导出
export type AppConfig = z.infer<typeof FullSchema>;

// 配置验证函数
export const validateConfig = (env: NodeJS.ProcessEnv): AppConfig => {
  try {
    return FullSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingKeys = error.errors
        .filter(e => e.code === "invalid_type")
        .map(e => e.path.join("."));
      
      throw new Error(
        `Configuration validation failed: 
        Missing or invalid keys: ${missingKeys.join(", ")}
        Full error: ${error.message}`
      );
    }
    throw new Error("Unexpected error during configuration validation");
  }
};

// 验证并导出配置
export const config = validateConfig(process.env);