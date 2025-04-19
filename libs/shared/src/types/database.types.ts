export interface DatabaseMonitor {
    startMonitoring(): void;
    stopMonitoring(): Promise<void>;
  }