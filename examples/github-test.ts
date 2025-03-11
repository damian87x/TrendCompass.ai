/**
 * Test script for the GitHub webhook integration
 */

import { GitHubDriver } from '../packages/integrations/src';
import { notify } from '../packages/core/src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGitHubWebhook() {
  console.log('============================================');
  console.log('🚀 TrendCompass GitHub Integration Test');
  console.log('============================================\n');

  // Check required GitHub configuration
  const githubOwner = process.env.GITHUB_OWNER;
  const githubRepo = process.env.GITHUB_REPO;
  const githubToken = process.env.GITHUB_TOKEN;
  const githubEventType = process.env.GITHUB_EVENT_TYPE || 'trend-compass-update';

  if (!githubOwner || !githubRepo || !githubToken) {
    console.error('Error: GitHub configuration is incomplete.');
    console.log('Please set the following environment variables:');
    console.log('- GITHUB_OWNER (repository owner/organization)');
    console.log('- GITHUB_REPO (repository name)');
    console.log('- GITHUB_TOKEN (GitHub personal access token)');
    console.log('\nOptionally, you can also set:');
    console.log('- GITHUB_EVENT_TYPE (default: "trend-compass-update")');
    process.exit(1);
  }

  console.log(`GitHub Configuration:\n`);
  console.log(`- Owner: ${githubOwner}`);
  console.log(`- Repository: ${githubRepo}`);
  console.log(`- Event Type: ${githubEventType}`);
  console.log(`- Token: ${githubToken.substring(0, 4)}...${githubToken.substring(githubToken.length - 4)}`);

  // Create test content
  const testContent = `# TrendCompass GitHub Test - ${new Date().toISOString()}

This is a test message from the TrendCompass GitHub integration.

## Trending Topics
- Artificial Intelligence advancements
- Climate tech innovations
- Quantum computing breakthroughs
- Remote work culture shifts

> This notification was sent as a GitHub repository_dispatch event.`;

  // Create GitHub driver
  console.log('\nCreating GitHub driver...');
  const githubDriver = new GitHubDriver(
    githubOwner,
    githubRepo,
    githubToken,
    githubEventType
  );

  // Send notification
  console.log('Sending test notification to GitHub...');
  try {
    await notify(testContent, githubDriver);
    console.log('✅ GitHub repository_dispatch event sent successfully!');
    console.log('\nCheck your GitHub repository\'s Actions tab to see if a workflow was triggered.');
    console.log('Note: You need to configure a workflow that listens for the "repository_dispatch" event');
    console.log('with the event_type "' + githubEventType + '" to see the notification in GitHub Actions.');
  } catch (error) {
    console.error('❌ GitHub notification failed:', error);
    process.exit(1);
  }
}

// Run the test
testGitHubWebhook().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
