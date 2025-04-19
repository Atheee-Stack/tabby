这段代码定义了一个 类型断言函数 `assertIsError`，它的核心作用是 在运行时验证一个未知类型的错误 (`unknown`) 是否是 `Error` 类型的实例。如果不是，则抛出明确的错误信息，帮助开发者快速定位问题。

代码逐行解释

```typescript
export function assertIsError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    throw new Error(`Unexpected error type: ${typeof error}`);
  }
}
```

1. `export function assertIsError`  
   导出一个名为 `assertIsError` 的函数，使其可在其他模块中使用。

2. `error: unknown`  
   函数接受一个参数 `error`，类型为 `unknown`。这表明调用此函数时，可以传入任意类型的值（因为 `unknown` 是 TypeScript 中最通用的安全类型）。

3. `: asserts error is Error`  
   这是 类型断言签名。它告诉 TypeScript：  
   • 如果函数正常执行（没有抛出错误），则 `error` 的类型会被缩小为 `Error`。  

   • 如果函数抛出错误，则说明 `error` 不是 `Error` 类型。


4. `if (!(error instanceof Error))`  
   检查 `error` 是否是 `Error` 类或其子类的实例。`instanceof` 是 JavaScript 的运行时类型检查操作符。

5. `throw new Error(...)`  
   如果 `error` 不是 `Error` 类型，抛出一个新的 `Error`，提示开发者遇到了意外的错误类型（例如，抛出了一个字符串或数字）。

---

使用场景

假设你在 `try/catch` 中捕获一个错误，但不确定其类型：

```typescript
try {
  // 可能抛出非 Error 类型的错误，例如：throw "Something went wrong";
  someRiskyOperation();
} catch (error) {
  // 此时 error 的类型是 unknown（假设启用了 useUnknownInCatchVariables）
  assertIsError(error); // 如果执行到这里没有报错，error 的类型会被 TypeScript 推断为 Error

  // 现在可以安全访问 error.message
  console.log(error.message);
}
```

1. 类型安全性：  
   通过调用 `assertIsError(error)`，你明确告诉 TypeScript：“此处的 `error` 一定是 `Error` 类型”。如果 `error` 是其他类型（如字符串），函数会抛出错误，避免后续代码错误地访问 `message` 属性。

2. 调试友好性：  
   如果抛出的错误不是 `Error` 类型（例如 `throw 42`），你会收到明确的错误信息：  
   ```text
   Error: Unexpected error type: number
   ```

---

为什么需要这个函数？

1. 处理 `unknown` 类型：  
   当 TypeScript 配置了 `"useUnknownInCatchVariables": true` 时，`catch` 中的错误变量类型是 `unknown`。直接访问 `error.message` 会导致编译错误，因为 `unknown` 类型不允许直接访问属性。

2. 替代方案对比：  
   • ❌ 直接类型断言（不安全）：  

     ```typescript
     console.log((error as Error).message); // 如果 error 不是 Error，运行时崩溃！
     ```
   • ✅ 使用 `assertIsError`（安全）：  

     先验证类型，再安全使用属性。

---

总结

• 作用：运行时验证错误类型，并缩小 TypeScript 类型范围。

• 关键点：  

  • `asserts error is Error` 是 TypeScript 的类型断言语法。  

  • `instanceof Error` 是 JavaScript 的运行时类型检查。  

  • 与 `useUnknownInCatchVariables` 配合使用，提升类型安全性。