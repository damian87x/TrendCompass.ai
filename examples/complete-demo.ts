/**
 * Comprehensive demo application that uses all TrendCompass packages together
 * 
 * This example demonstrates:
 * - Core: Configuration loading, scraping, and draft generation
 * - Integrations: Using notification drivers (Discord & Slack)
 * - Scheduler: Setting up automated runs with a cron schedule
 * - CLI: Exposing functionality through a command-line interface
 */

import {
  loadConfig,
  scrapeSources,
  generateDraft,
  notify,
} from '../packages/core/src';

import {
  createNotificationDriver,
  SlackDriver,
  DiscordDriver,
  WebhookDriver,
  GitHubDriver
} from '../packages/integrations/src';

import { scheduleTrendCompass } from '../packages/scheduler/src/cron';

// Load configuration from file and environment variables
const config = loadConfig();
console.log('Loaded configuration:', JSON.stringify(config, null, 2));

/**
 * Function to run the complete TrendCompass process once
 */
async function runTrendCompassProcess() {
  try {
    // Step 1: Scrape sources
    console.log('\n🔍 Scraping trending topics from sources...');
    const sources = config.customSources || [];
    const stories = await scrapeSources(sources, config.firecrawlApiKey);
    console.log(`Found ${stories.length} stories`);
    
    if (stories.length === 0) {
      console.log('No stories found. Exiting.');
      return;
    }
    
    // Step 2: Generate draft
    console.log('\n✍️ Generating draft post...');
    const draft = await generateDraft(stories, config.openAIApiKey);
    console.log('Draft generated successfully!');
    console.log('\n==================== DRAFT POST ====================');
    console.log(draft);
    console.log('====================================================\n');
    
    // Step 3: Send notifications
    if (config.notificationConfig.driver !== 'none') {
      console.log(`\n📢 Sending notification via ${config.notificationConfig.driver}...`);
      const driver = createNotificationDriver(config.notificationConfig);
      
      if (driver) {
        await notify(draft, driver);
        console.log('Notification sent successfully!');
      } else {
        console.log('Failed to create notification driver.');
      }
    } else {
      console.log('\n⚠️ Notifications disabled in configuration.');
    }
    
    return { success: true, message: 'TrendCompass process completed successfully.' };
  } catch (error) {
    console.error('\n❌ Error running TrendCompass:', error);
    return { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/**
 * Demo functionality to switch between different notification drivers
 */
async function demonstrateMultipleDrivers() {
  const demoContent = `# TrendCompass Demo - ${new Date().toDateString()}\n\n` +
    `This is a demonstration of sending the same content through multiple notification channels.\n\n` +
    `## Features\n` +
    `- Core package for content generation\n` +
    `- Multiple notification integrations\n` +
    `- Scheduling capabilities\n` +
    `- Command-line interface\n`;
  
  console.log('\n🔄 Testing multiple notification drivers...');
  
  // Example: Using the Discord driver
  if (process.env['DISCORD_WEBHOOK_URL']) {
    const discordDriver = new DiscordDriver(process.env['DISCORD_WEBHOOK_URL']);
    
    console.log('Sending to Discord...');
    try {
      await notify(demoContent, discordDriver);
      console.log('Discord notification sent!');
    } catch (error) {
      console.error('Discord notification failed:', error);
    }
  } else {
    console.log('Discord webhook URL not found in environment variables, skipping...');
  }
  
  // Example: Using the Slack driver
  if (process.env['SLACK_WEBHOOK_URL']) {
    const slackDriver = new SlackDriver(process.env['SLACK_WEBHOOK_URL']);
    
    console.log('Sending to Slack...');
    try {
      await notify(demoContent, slackDriver);
      console.log('Slack notification sent!');
    } catch (error) {
      console.error('Slack notification failed:', error);
    }
  } else {
    console.log('Slack webhook URL not found in environment variables, skipping...');
  }
  
  // Example: Using the generic Webhook driver
  if (process.env['GENERIC_WEBHOOK_URL']) {
    const webhookDriver = new WebhookDriver(
      process.env['GENERIC_WEBHOOK_URL'],
      // Optional custom headers if needed
      process.env['WEBHOOK_CUSTOM_HEADERS'] ? JSON.parse(process.env['WEBHOOK_CUSTOM_HEADERS']) : undefined
    );
    
    console.log('Sending to generic webhook...');
    try {
      await notify(demoContent, webhookDriver);
      console.log('Webhook notification sent!');
    } catch (error) {
      console.error('Webhook notification failed:', error);
    }
  } else {
    console.log('Generic webhook URL not found in environment variables, skipping...');
  }
  
  // Example: Using the GitHub driver
  if (process.env['GITHUB_OWNER'] && process.env['GITHUB_REPO'] && process.env['GITHUB_TOKEN']) {
    const githubDriver = new GitHubDriver(
      process.env['GITHUB_OWNER'],
      process.env['GITHUB_REPO'],
      process.env['GITHUB_TOKEN'],
      process.env['GITHUB_EVENT_TYPE'] || 'trend-compass-update'
    );
    
    console.log('Sending to GitHub repository dispatch...');
    try {
      await notify(demoContent, githubDriver);
      console.log('GitHub notification sent!');
    } catch (error) {
      console.error('GitHub notification failed:', error);
    }
  } else {
    console.log('GitHub configuration not found in environment variables, skipping...');
  }
}

/**
 * Demo functionality to set up a scheduled job
 */
function demonstrateScheduler() {
  console.log('\n⏰ Setting up a scheduled job (will run every minute for demo purposes)...');
  
  // Set up a scheduler that runs every minute for demonstration purposes
  const cronExpression = '* * * * *'; // Every minute
  
  const stopScheduler = scheduleTrendCompass(
    config,
    cronExpression,
    (result) => {
      console.log(`Scheduled job completed with result: ${result.message}`);
    }
  );
  
  // For demo purposes, we'll stop the scheduler after 2 minutes
  console.log('Scheduler will run for 2 minutes and then be stopped automatically.');
  setTimeout(() => {
    stopScheduler();
    console.log('\n⏹️ Scheduled job has been stopped.');
    
    // End the demo after everything is complete
    console.log('\n✅ Complete demo has finished! Exiting...');
    process.exit(0);
  }, 2 * 60 * 1000); // 2 minutes
}

/**
 * Main function to run the complete demo
 */
async function runCompleteDemo() {
  console.log('============================================');
  console.log('🚀 TrendCompass Complete Demo');
  console.log('============================================\n');
  
  // Run the complete process once
  console.log('\n📋 Running the complete TrendCompass process...');
  await runTrendCompassProcess();
  
  // Demonstrate multiple notification drivers
  await demonstrateMultipleDrivers();
  
  // Demonstrate the scheduler (this will block for 2 minutes)
  demonstrateScheduler();
}

// Run the demo
runCompleteDemo().catch(error => {
  console.error('Demo failed with error:', error);
  process.exit(1);
});
