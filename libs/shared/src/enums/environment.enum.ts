// environment.enum.ts
export enum EnvKeys {
  NODE_ENV = "NODE_ENV",
  PORT = "PORT",
}

export enum Environment {
  Example = "example",
  Development = "development",
  Production = "production",
  Test = "test",
}
// 冻结枚举对象防止修改
Object.freeze(Environment);

export type EnvironmentType = typeof Environment[keyof typeof Environment];


