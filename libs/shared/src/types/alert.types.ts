// src/alert/alert.types.ts
export type AlertChannelType = 'email' | 'slack' | 'sms' | 'webhook';

export interface AlertOptions {
  type: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  channels?: AlertChannelType[];
}

export interface AlertChannel {
  send(options: AlertOptions): Promise<void>;
  isConfigured(): boolean;
}