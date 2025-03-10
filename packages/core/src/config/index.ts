import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { TrendCompassConfig } from '../types';

dotenv.config();

/**
 * Loads configuration from environment variables and JSON config file
 * @returns The merged configuration
 */
export function loadConfig(): TrendCompassConfig {
  const configPath = path.join(process.cwd(), 'trend-compass.config.json');
  let jsonConfig: Partial<TrendCompassConfig> = {};
  
  if (fs.existsSync(configPath)) {
    try {
      jsonConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.error(`Error reading config file: ${error}`);
    }
  }

  return {
    firecrawlApiKey: process.env['FIRECRAWL_API_KEY'] || jsonConfig.firecrawlApiKey,
    openAIApiKey: process.env['OPENAI_API_KEY'] || jsonConfig.openAIApiKey,
    notificationConfig: {
      driver: (process.env['NOTIFICATION_DRIVER'] || jsonConfig.notificationConfig?.driver || 'none') as 'slack' | 'discord' | 'none',
      webhookUrl: process.env['DISCORD_WEBHOOK_URL'] ||
                process.env['SLACK_WEBHOOK_URL'] ||
                jsonConfig.notificationConfig?.webhookUrl ||
                ''
    },
    customSources: jsonConfig.customSources || [],
  };
}
