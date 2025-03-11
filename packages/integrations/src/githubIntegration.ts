import axios from 'axios';
import { NotificationDriver } from '../../core/src/types';

/**
 * GitHub webhook notification driver implementation
 */
export class GitHubDriver implements NotificationDriver {
  /**
   * Creates a new GitHub webhook driver
   * @param owner The GitHub repository owner/organization
   * @param repo The GitHub repository name
   * @param token GitHub Personal Access Token with repo scope
   * @param eventType The repository_dispatch event type (default: 'trend-compass-update')
   */
  constructor(
    private owner: string,
    private repo: string,
    private token: string,
    private eventType: string = 'trend-compass-update'
  ) {
    if (!owner || !repo || !token) {
      throw new Error('GitHub owner, repo, and token are required');
    }
  }

  /**
   * Sends a message to GitHub as a repository_dispatch event
   * @param content The message content
   * @returns A promise that resolves when the message is sent
   */
  async send(content: string): Promise<void> {
    try {
      // GitHub repository_dispatch endpoint
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/dispatches`;
      
      // Format the payload for GitHub's repository_dispatch API
      const payload = {
        event_type: this.eventType,
        client_payload: {
          content,
          timestamp: new Date().toISOString()
        }
      };

      await axios.post(
        url,
        payload,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          },
        }
      );
    } catch (error) {
      console.error('Error sending message to GitHub webhook:', error);
      throw error;
    }
  }
}
