// src/alert/alert.service.ts
import { Injectable, Logger } from '@nestjs/common';
import type { AlertOptions, AlertChannel, AlertChannelType } from '../types/alert.types.js';
import { ConfigService } from '../config/env/config.service.js';
import { EmailChannel } from './channels/email.channel.js';
import { SlackChannel } from './channels/slack.channel.js';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly channels: Partial<Record<AlertChannelType, AlertChannel>>;

  constructor(private readonly configService: ConfigService) {
    this.channels = {
      email: new EmailChannel(configService),
      slack: new SlackChannel(configService),
    };
  }

  async sendCriticalAlert(options: AlertOptions): Promise<void> {
    try {
      const validChannels = this.getValidChannels(options.channels);
      
      await Promise.allSettled(
        validChannels.map(channel => 
          channel.send(options).catch(error => 
            this.logger.error(`Failed to send alert via ${channel.constructor.name}: ${error.message}`)
          )
        )
      );
    } catch (error) {
      this.logger.error(`Critical alert failed: ${error.message}`);
      throw error;
    }
  }

  private getValidChannels(requestedChannels?: AlertChannelType[]): AlertChannel[] {
    const channelsToUse = requestedChannels || Object.keys(this.channels) as AlertChannelType[];
    
    return channelsToUse
      .map(type => this.channels[type])
      .filter((channel): channel is AlertChannel => 
        !!channel && channel.isConfigured()
      );
  }

  async sendRecoveryAlert(): Promise<void> {
    await this.sendCriticalAlert({
      type: 'DATABASE_RECOVERED',
      message: 'Database connection has been restored',
      timestamp: new Date(),
      channels: ['slack'] // 默认使用Slack通知恢复
    });
  }
}