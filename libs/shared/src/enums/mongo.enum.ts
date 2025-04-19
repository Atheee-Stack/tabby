// config.enums.ts
// 环境变量键名枚举（推荐使用，避免硬编码字符串）
export enum EnvKeys {
  MONGO_DB_NAME_DEVELOPMENT = "MONGO_DB_NAME_DEVELOPMENT",
  MONGO_CLIENT_URL_DEVELOPMENT = "MONGO_CLIENT_URL_DEVELOPMENT",
  MONGO_AUTH_MECHANISM = "MONGO_AUTH_MECHANISM",
  MONGO_TLS_ENABLED = "MONGO_TLS_ENABLED",
  MONGO_TLS_CA_FILE = "MONGO_TLS_CA_FILE",
  MONGO_POOL_MIN = "MONGO_POOL_MIN",
  MONGO_POOL_MAX = "MONGO_POOL_MAX",
  MONGO_IDLE_TIMEOUT_MS = "MONGO_IDLE_TIMEOUT_MS",
  MONGO_READ_PREFERENCE = "MONGO_READ_PREFERENCE",
  MONGO_WRITE_CONCERN = "MONGO_WRITE_CONCERN",
  MONGO_USERNAME = "MONGO_USERNAME",
  MONGO_PASSWORD = "MONGO_PASSWORD",
  MONGO_CONN_TIMEOUT = "MONGO_CONN_TIMEOUT",
  MONGO_SOCKET_TIMEOUT = "MONGO_SOCKET_TIMEOUT",
  MONGO_MAX_RETRIES = "MONGO_MAX_RETRIES",
  MONGO_RETRY_DELAY = "MONGO_RETRY_DELAY",
}

export const MongoAuthMechanism = {
  SCRAM_SHA_256: "SCRAM-SHA-256",
  SCRAM_SHA_1: "SCRAM-SHA-1",
  MONGODB_X509: "MONGODB-X509",
} as const;

export enum MongoTLS {
  ENABLED = "true",
  DISABLED = "false",
}

export const MongoReadPreference = {
  PRIMARY: "primary",
  PRIMARY_PREFERRED: "primaryPreferred",
  SECONDARY: "secondary",
  SECONDARY_PREFERRED: "secondaryPreferred",
  NEAREST: "nearest",
} as const;

export const MongoWriteConcern = {
  MAJORITY: "majority",
  ACKNOWLEDGED: "1",
  UNACKNOWLEDGED: "0",
} as const;

// 类型守卫验证函数（可选增强类型安全）
export const isMongoReadPreference = (value: string): value is MongoReadPreference => {
  return Object.values(MongoReadPreference).includes(value as MongoReadPreference);
};

Object.freeze(MongoAuthMechanism);
Object.freeze(MongoTLS);
Object.freeze(MongoReadPreference);
Object.freeze(MongoWriteConcern);

export type MongoAuthMechanism = typeof MongoAuthMechanism[keyof typeof MongoAuthMechanism];
export type MongoTLSType = keyof typeof MongoTLS;
export type MongoReadPreference = typeof MongoReadPreference[keyof typeof MongoReadPreference];
export type MongoWriteConcern = typeof MongoWriteConcern[keyof typeof MongoWriteConcern];