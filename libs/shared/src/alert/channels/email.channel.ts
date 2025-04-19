// src/alert/channels/email.channel.ts
import { ConfigService } from '../../config/env/config.service.js';
import type { AlertChannel, AlertOptions } from '../../types/alert.types.js';

export class EmailChannel implements AlertChannel {
  private readonly config: {
    smtpHost?: string;
    smtpPort?: number;
    fromAddress?: string;
    toAddresses?: string[];
  };

  constructor(configService: ConfigService) {
    this.config = {
      smtpHost: configService.get('ALERT_EMAIL_SMTP_HOST'),
      smtpPort: configService.get('ALERT_EMAIL_SMTP_PORT'),
      fromAddress: configService.get('ALERT_EMAIL_FROM'),
      toAddresses: configService.getArray('ALERT_EMAIL_TO'),
    };
  }

  async send(options: AlertOptions): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Email channel is not properly configured');
    }

    // 实现邮件发送逻辑
    console.log(`Sending email alert: ${options.message}`);
    // 实际应使用 nodemailer 或其他邮件库
  }

  isConfigured(): boolean {
    return !!(
      this.config.smtpHost &&
      this.config.smtpPort &&
      this.config.fromAddress &&
      this.config.toAddresses?.length
    );
  }
}