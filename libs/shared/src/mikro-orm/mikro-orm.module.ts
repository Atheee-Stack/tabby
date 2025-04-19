// src/mikro-orm/mikro-orm.module.ts
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '../config/env/config.service.js';
import { Options } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { Logger, Module } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('MikroORM');
        return {
          driver: MongoDriver,
          connectTimeout: config.mikroOrmConfig.connectionTimeout,
          clientUrl: config.mikroOrmConfig.clientUrl,
          dbName: config.mikroOrmConfig.dbName,
          user: config.mikroOrmConfig.auth.username,
          password: config.mikroOrmConfig.auth.password,
          authMechanism: config.mikroOrmConfig.auth.mechanism,
          tls: config.mikroOrmConfig.tls,
          tlsCAFile: config.mikroOrmConfig.tlsCAFile,
          pool: config.mikroOrmConfig.pool,
          driverOptions: {
            serverSelectionTimeoutMS: config.mikroOrmConfig.connectionTimeout,
            socketTimeoutMS: config.mikroOrmConfig.socketTimeout,
            heartbeatFrequencyMS: 5000, // 心跳检测
            retryWrites: true,
            retryReads: true,
            readPreference: config.mikroOrmConfig.readPreference,
            writeConcern: {
              w: config.mikroOrmConfig.writeConcern,
            },
            logger: (message: string) => logger.debug(message),
            discovery: {
              warnWhenNoEntities: config.isProduction ? false : true,
            },
            events: {
              onConnect: async () => {
                logger.log('Database connection established');
              },
              onClose: async () => {
                logger.warn('Database connection closed');
              },
              onError: (error: Error) => {
                logger.error(`Database error: ${error.message}`);
              },
            },
          },
          autoLoadEntities: true,
          debug: !config.isProduction,
        } as Options<MongoDriver>;
      },
    }),
  ],
  exports: [MikroOrmModule],
})
export class CustomMikroOrmModule {}
