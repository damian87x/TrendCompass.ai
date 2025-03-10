#!/usr/bin/env node

import { loadConfig, runTrendCompass } from '@trend-compass/core';
import { createNotificationDriver } from '@trend-compass/integrations';
import { scheduleTrendCompass } from '@trend-compass/scheduler';

async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'run';
    
    const config = loadConfig();
    console.log("Loaded configuration:", JSON.stringify(config, null, 2));
    
    const notificationDriver = config.notificationConfig.driver !== 'none'
      ? createNotificationDriver(config.notificationConfig)
      : null;
    
    switch (command) {
      case 'run':
        console.log("Running TrendCompass...");
        const result = await runTrendCompass(config, notificationDriver);
        console.log("Result:", result);
        break;
        
      case 'schedule':
        const cronExpression = args[1] || '0 9 * * *';
        console.log(`Scheduling TrendCompass with cron expression: ${cronExpression}`);
        
        const stopScheduler = scheduleTrendCompass(
          config,
          cronExpression,
          (result) => console.log("Scheduled run completed:", result.message)
        );
        
        console.log("Press Ctrl+C to stop the scheduler");
        process.on('SIGINT', () => {
          stopScheduler();
          process.exit(0);
        });
        break;
        
      case 'help':
      default:
        console.log(`
TrendCompass CLI Usage:

  trend-compass [command] [options]

Commands:
  run                  Run TrendCompass immediately (default)
  schedule [cron]      Schedule TrendCompass with optional cron expression
  help                 Show this help message

Examples:
  trend-compass run
  trend-compass schedule "0 9 * * *"
`);
        break;
    }
  } catch (error) {
    console.error("Error in TrendCompass CLI:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
