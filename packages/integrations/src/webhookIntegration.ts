import axios from 'axios';
import { NotificationDriver } from '../../core/src/types';

/**
 * Generic Webhook notification driver implementation
 */
export class WebhookDriver implements NotificationDriver {
  /**
   * Creates a new Webhook driver
   * @param webhookUrl The webhook URL to send notifications to
   * @param customHeaders Optional custom headers to include with the request
   * @param customPayloadBuilder Optional function to transform content into a custom payload format
   */
  constructor(
    private webhookUrl: string,
    private customHeaders: Record<string, string> = {},
    private customPayloadBuilder?: (content: string) => Record<string, any>
  ) {
    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }
  }

  /**
   * Sends a message to the webhook endpoint
   * @param content The message content
   * @returns A promise that resolves when the message is sent
   */
  async send(content: string): Promise<void> {
    try {
      const payload = this.customPayloadBuilder
        ? this.customPayloadBuilder(content)
        : { content, timestamp: new Date().toISOString() };

      await axios.post(
        this.webhookUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.customHeaders
          },
        }
      );
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      throw error;
    }
  }
}
