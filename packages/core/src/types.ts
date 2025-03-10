/**
 * Core types and interfaces for TrendCompass
 */

/**
 * Configuration type for TrendCompass
 */
export interface TrendCompassConfig {
  firecrawlApiKey?: string;
  openAIApiKey?: string;
  notificationConfig: {
    driver: 'slack' | 'discord' | 'none';
    webhookUrl: string;
  };
  customSources?: { identifier: string }[];
}

/**
 * Story type for scraped content
 */
export interface Story {
  headline: string;
  link: string;
  date_posted: string;
}

/**
 * Notification driver interface
 */
export interface NotificationDriver {
  send(content: string): Promise<void>;
}
