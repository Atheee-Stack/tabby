/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@taddy/shared-lib'; // 修改为本地路径

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    // ...
  } catch (error) {
    if (error.message.startsWith('Configuration validation failed')) {
      console.error('❌ Configuration Error:', error.message);
      process.exit(1);
    }
    throw error;
  }
  
  // 获取配置服务实例
  const config = app.get(ConfigService);
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // 使用配置服务中的端口
  const port = config.port || 3000;
  
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}


bootstrap();