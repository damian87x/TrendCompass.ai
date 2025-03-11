/**
 * Test script for the generic webhook integration
 */

import { WebhookDriver } from '../packages/integrations/src';
import { notify } from '../packages/core/src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testWebhook() {
  console.log('============================================');
  console.log('🧪 TrendCompass Webhook Integration Test');
  console.log('============================================\n');

  const webhookUrl = process.env.GENERIC_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('Error: GENERIC_WEBHOOK_URL environment variable is not set.');
    console.log('Please set it in your .env file or export it in your terminal.');
    process.exit(1);
  }

  // Parse custom headers if provided
  let customHeaders: Record<string, string> | undefined;
  const headersEnv = process.env.WEBHOOK_CUSTOM_HEADERS;
  if (headersEnv) {
    try {
      customHeaders = JSON.parse(headersEnv);
      console.log('Using custom headers:', customHeaders);
    } catch (error) {
      console.error('Error parsing WEBHOOK_CUSTOM_HEADERS:', error);
      console.log('Continuing without custom headers.');
    }
  }

  // Create test content
  const testContent = `# TrendCompass Webhook Test - ${new Date().toISOString()}

This is a test message from the TrendCompass webhook integration.

## Features
- Generic webhook support
- Custom headers support
- Standard JSON payload format
`;

  // Create webhook driver
  console.log(`Creating webhook driver with URL: ${webhookUrl}`);
  const webhookDriver = new WebhookDriver(webhookUrl, customHeaders);

  // Send notification
  console.log('Sending test notification to webhook...');
  try {
    await notify(testContent, webhookDriver);
    console.log('✅ Webhook notification sent successfully!');
  } catch (error) {
    console.error('❌ Webhook notification failed:', error);
    process.exit(1);
  }
}

// Run the test
testWebhook().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
