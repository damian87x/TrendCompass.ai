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
    driver: 'slack' | 'discord' | 'webhook' | 'github' | 'none';
    webhookUrl?: string;
    customHeaders?: Record<string, string>;
    githubOwner?: string;
    githubRepo?: string;
    githubToken?: string;
    githubEventType?: string;
  };
  sources?: {
    websites?: Array<{
      identifier: string;
      category: string;
    }>;
    twitter?: {
      enabled: boolean;
      handles: string[];
    };
  };
  customSources?: Array<{
    identifier: string;
    category?: string;
  }>;
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
