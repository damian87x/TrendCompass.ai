import axios from 'axios';
import { NotificationDriver } from '@trend-compass/core';

/**
 * Discord notification driver implementation
 */
export class DiscordDriver implements NotificationDriver {
  /**
   * Creates a new Discord driver
   * @param webhookUrl The Discord webhook URL
   */
  constructor(private webhookUrl: string) {
    if (!webhookUrl) {
      throw new Error('Discord webhook URL is required');
    }
  }

  /**
   * Sends a message to Discord
   * @param content The message content
   * @returns A promise that resolves when the message is sent
   */
  async send(content: string): Promise<void> {
    try {
      await axios.post(
        this.webhookUrl,
        {
          content: content,
          flags: 4
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error sending message to Discord webhook:', error);
      throw error;
    }
  }
}
