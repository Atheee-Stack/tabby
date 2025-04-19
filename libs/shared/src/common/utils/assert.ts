// src/common/utils/assert.ts
/**
 * 
 * @param error ：运行时验证错误类型，并缩小 TypeScript 类型范围。
 */
export function assertIsError(error: unknown): asserts error is Error {
    if (!(error instanceof Error)) {
      throw new Error(`Unexpected error type: ${typeof error}`);
    }
  }
