/**
 * Utilità di logging per DomusAI
 */

export interface LogLevel {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
}

export class Logger {
  private level: number;
  private levels: LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor(private context: string) {
    this.level = this.levels.INFO;
  }

  log(message: string, data?: any): void {
    if (this.level <= this.levels.INFO) {
      console.log(`[${this.context}] INFO: ${message}`, data || '');
    }
  }

  debug(message: string, data?: any): void {
    if (this.level <= this.levels.DEBUG) {
      console.debug(`[${this.context}] DEBUG: ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.level <= this.levels.WARN) {
      console.warn(`[${this.context}] WARN: ${message}`, data || '');
    }
  }

  error(message: string, error?: Error): void {
    if (this.level <= this.levels.ERROR) {
      console.error(`[${this.context}] ERROR: ${message}`, error?.message || '');
    }
  }
}
