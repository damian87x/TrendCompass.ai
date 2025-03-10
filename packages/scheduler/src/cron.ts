import cron from 'node-cron';
import { TrendCompassConfig, runTrendCompass } from '@trend-compass/core';
import { createNotificationDriver } from '@trend-compass/integrations';

/**
 * Schedules the TrendCompass process to run according to a cron expression
 * @param config The TrendCompass configuration
 * @param cronExpression The cron expression for scheduling (default: runs at 9 AM daily)
 * @param onComplete Optional callback that runs after completion
 * @returns A function to stop the scheduled task
 */
export function scheduleTrendCompass(
  config: TrendCompassConfig,
  cronExpression = '0 9 * * *',
  onComplete?: (result: any) => void
) {
  console.log(`Scheduling TrendCompass to run with cron expression: ${cronExpression}`);
  
  if (!cron.validate(cronExpression)) {
    throw new Error(`Invalid cron expression: ${cronExpression}`);
  }
  
  const task = cron.schedule(cronExpression, async () => {
    console.log(`Starting scheduled TrendCompass job at ${new Date().toISOString()}`);
    
    try {
      const notificationDriver = config.notificationConfig.driver !== 'none'
        ? createNotificationDriver(config.notificationConfig)
        : null;
      const result = await runTrendCompass(config, notificationDriver);
      
      console.log('TrendCompass job completed:', result.message);
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error in scheduled TrendCompass job:', error);
    }
  });
  
  return () => {
    task.stop();
    console.log('TrendCompass scheduler stopped');
  };
}
