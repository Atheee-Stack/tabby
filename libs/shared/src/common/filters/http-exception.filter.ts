// src/common/filters/http-exception.filter.ts
import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 全局异常过滤器
 * 主要作用是为所有 HTTP 请求的异常提供统一的错误响应格式。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : 500;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception instanceof Error 
        ? exception.message 
        : 'Unexpected error occurred',
    });
  }
}