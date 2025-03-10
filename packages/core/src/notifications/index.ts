import { NotificationDriver } from '../types';

/**
 * Sends a notification using the provided driver
 * @param content The content to send
 * @param driver The notification driver to use
 * @returns A promise that resolves when the notification is sent
 */
export async function notify(
  content: string,
  driver: NotificationDriver
): Promise<void> {
  if (!driver) {
    throw new Error('Notification driver is not provided');
  }
  
  try {
    await driver.send(content);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
