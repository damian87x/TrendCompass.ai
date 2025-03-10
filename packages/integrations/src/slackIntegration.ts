import axios from 'axios';
import { NotificationDriver } from '@trend-compass/core';

/**
 * Slack notification driver implementation
 */
export class SlackDriver implements NotificationDriver {
  /**
   * Creates a new Slack driver
   * @param webhookUrl The Slack webhook URL
   */
  constructor(private webhookUrl: string) {
    if (!webhookUrl) {
      throw new Error('Slack webhook URL is required');
    }
  }

  /**
   * Sends a message to Slack
   * @param content The message content
   * @returns A promise that resolves when the message is sent
   */
  async send(content: string): Promise<void> {
    try {
      await axios.post(
        this.webhookUrl,
        {
          text: content,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error sending message to Slack webhook:', error);
      throw error;
    }
  }
}
