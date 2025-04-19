// src/alert/channels/slack.channel.ts
import { ConfigService } from '../../config/env/config.service.js';
import type { AlertChannel, AlertOptions } from '../../types/alert.types.js';

export class SlackChannel implements AlertChannel {
  private readonly webhookUrl?: string;

  constructor(configService: ConfigService) {
    this.webhookUrl = configService.get('ALERT_SLACK_WEBHOOK_URL');
  }

  async send(options: AlertOptions): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Slack channel is not properly configured');
    }

    // 实现Slack消息发送
    console.log(`Sending Slack alert: ${options.message}`);
    // 实际应使用 axios 发送 webhook
  }

  isConfigured(): boolean {
    return !!this.webhookUrl;
  }
}