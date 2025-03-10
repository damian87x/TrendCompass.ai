/**
 * Integrations library exports for TrendCompass
 */
export * from './slackIntegration';
export * from './discordIntegration';

/**
 * Creates a notification driver based on the configuration
 * @param config The notification configuration
 * @returns The appropriate notification driver
 */
export function createNotificationDriver(config: {
  driver: 'slack' | 'discord' | 'none';
  webhookUrl: string;
}) {
  const { driver, webhookUrl } = config;
  
  if (!webhookUrl) {
    throw new Error('Webhook URL is required');
  }
  
  switch (driver) {
    case 'slack': {
      const { SlackDriver } = require('./slackIntegration');
      return new SlackDriver(webhookUrl);
    }
    case 'discord': {
      const { DiscordDriver } = require('./discordIntegration');
      return new DiscordDriver(webhookUrl);
    }
    case 'none':
      return null;
    default:
      throw new Error(`Unsupported notification driver: ${driver}`);
  }
}
