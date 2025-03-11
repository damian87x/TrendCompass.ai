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

  // Get the notification driver from env or config
  const driver = process.env['NOTIFICATION_DRIVER'] || jsonConfig.notificationConfig?.driver || 'none';
  
  // Build notification config based on driver type
  let notificationConfig: any = { driver };
  
  // Add appropriate webhook URL based on driver type
  if (driver === 'slack') {
    notificationConfig.webhookUrl = process.env['SLACK_WEBHOOK_URL'] || jsonConfig.notificationConfig?.webhookUrl || '';
  } else if (driver === 'discord') {
    notificationConfig.webhookUrl = process.env['DISCORD_WEBHOOK_URL'] || jsonConfig.notificationConfig?.webhookUrl || '';
  } else if (driver === 'webhook') {
    notificationConfig.webhookUrl = process.env['GENERIC_WEBHOOK_URL'] || jsonConfig.notificationConfig?.webhookUrl || '';
    // Add custom headers if present
    if (process.env['WEBHOOK_CUSTOM_HEADERS']) {
      try {
        notificationConfig.customHeaders = JSON.parse(process.env['WEBHOOK_CUSTOM_HEADERS']);
      } catch (error) {
        console.error(`Error parsing WEBHOOK_CUSTOM_HEADERS: ${error}`);
      }
    } else if (jsonConfig.notificationConfig?.customHeaders) {
      notificationConfig.customHeaders = jsonConfig.notificationConfig.customHeaders;
    }
  } else if (driver === 'github') {
    notificationConfig.githubOwner = process.env['GITHUB_OWNER'] || jsonConfig.notificationConfig?.githubOwner || '';
    notificationConfig.githubRepo = process.env['GITHUB_REPO'] || jsonConfig.notificationConfig?.githubRepo || '';
    notificationConfig.githubToken = process.env['GITHUB_TOKEN'] || jsonConfig.notificationConfig?.githubToken || '';
    notificationConfig.githubEventType = process.env['GITHUB_EVENT_TYPE'] || jsonConfig.notificationConfig?.githubEventType || 'trend-compass-update';
  }

  // Extract website sources from config if available
  const websites = jsonConfig.sources?.websites || [];
  const customSources = websites.map((site: { identifier: string; category: string }) => ({
    identifier: site.identifier,
    category: site.category
  }));

  return {
    firecrawlApiKey: process.env['FIRECRAWL_API_KEY'] || jsonConfig.firecrawlApiKey,
    openAIApiKey: process.env['OPENAI_API_KEY'] || jsonConfig.openAIApiKey,
    notificationConfig,
    customSources: jsonConfig.customSources || customSources,
  };
}
