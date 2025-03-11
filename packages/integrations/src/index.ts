/**
 * Integrations library exports for TrendCompass
 */
export * from './slackIntegration';
export * from './discordIntegration';
export * from './webhookIntegration';
export * from './githubIntegration';

/**
 * Creates a notification driver based on the configuration
 * @param config The notification configuration
 * @returns The appropriate notification driver
 */
export function createNotificationDriver(config: {
  driver: 'slack' | 'discord' | 'webhook' | 'github' | 'none';
  webhookUrl?: string;
  customHeaders?: Record<string, string>;
  githubOwner?: string;
  githubRepo?: string;
  githubToken?: string;
  githubEventType?: string;
}) {
  const { driver, webhookUrl, customHeaders, githubOwner, githubRepo, githubToken, githubEventType } = config;
  
  switch (driver) {
    case 'slack': {
      if (!webhookUrl) {
        throw new Error('Webhook URL is required for Slack driver');
      }
      const { SlackDriver } = require('./slackIntegration');
      return new SlackDriver(webhookUrl);
    }
    case 'discord': {
      if (!webhookUrl) {
        throw new Error('Webhook URL is required for Discord driver');
      }
      const { DiscordDriver } = require('./discordIntegration');
      return new DiscordDriver(webhookUrl);
    }
    case 'webhook': {
      if (!webhookUrl) {
        throw new Error('Webhook URL is required for Webhook driver');
      }
      const { WebhookDriver } = require('./webhookIntegration');
      return new WebhookDriver(webhookUrl, customHeaders);
    }
    case 'github': {
      if (!githubOwner || !githubRepo || !githubToken) {
        throw new Error('GitHub owner, repo, and token are required for GitHub driver');
      }
      const { GitHubDriver } = require('./githubIntegration');
      return new GitHubDriver(githubOwner, githubRepo, githubToken, githubEventType);
    }
    case 'none':
      return null;
    default:
      throw new Error(`Unsupported notification driver: ${driver}`);
  }
}
