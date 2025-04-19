export * from './lib/shared-lib.module';
/**
 * @deprecated
 * Use `@tabby/shared/config` instead
 * @see /libs/shared/config/README.md
 */
export * from './config/env/config.module';
export * from  './config/env/config.service';

/**
 * @deprecated
 * Use `@tabby/shared/alert` instead
 */
export * from './alert/alert.service';

/**
 * 运行时验证错误类型，并缩小 TypeScript 类型范围。
 */
export * from './common/utils/assert';