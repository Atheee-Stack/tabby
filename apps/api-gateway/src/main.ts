/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AlertService, ConfigService } from '@taddy/shared-lib';


async function bootstrap() {
  let app; // 在外部声明 app

  try {
    app = await NestFactory.create(AppModule); // 移除不需要的参数
    const config = app.get(ConfigService);
    
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    
    await app.listen(config.port);
    
    new Logger('Bootstrap').log(
      `🚀 Application is running on: http://localhost:${config.port}/${globalPrefix}`
    );
  } catch (error: unknown) { // 显式声明 error 类型
    const logger = new Logger('Bootstrap');
    
    // 类型安全的错误处理
    if (error instanceof Error) {
      logger.error(`Failed to start application: ${error.message}`);
      
      try {
        // 安全访问 app 实例
        if (app) {
          const alertService = app.get(AlertService);
          await alertService.sendCriticalAlert({
            type: 'STARTUP_FAILURE',
            message: `Application failed to start: ${error.message}`,
            timestamp: new Date(),
          });
        }
      } catch (alertError) {
        logger.error('Failed to send alert', alertError);
      }
    } else {
      logger.error('Unexpected startup error', error);
    }

    process.exit(1);
  }
}

bootstrap();