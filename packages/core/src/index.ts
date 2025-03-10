/**
 * Core library exports for TrendCompass
 */

export * from './types';
export * from './config';
export * from './scraping';
export * from './generation';
export * from './notifications';

/**
 * Main function to run the TrendCompass process
 * @param config Configuration object
 * @param notificationDriver Optional notification driver
 * @returns A promise that resolves with the result of the process
 */
export async function runTrendCompass(config: any, notificationDriver?: any) {
  const { scrapeSources } = await import('./scraping');
  const { generateDraft } = await import('./generation');
  const { notify } = await import('./notifications');
  
  try {
    const sources = config.customSources || [];
    const stories = await scrapeSources(
      sources,
      config.firecrawlApiKey,
      config.xApiToken
    );
    const draftPost = await generateDraft(stories, config.openAIApiKey);
    if (notificationDriver) {
      await notify(draftPost, notificationDriver);
    }
    
    return {
      success: true,
      message: `Completed TrendCompass process at ${new Date().toISOString()}`,
      draftPost
    };
  } catch (error) {
    console.error('Error running TrendCompass:', error);
    return {
      success: false,
      message: `Error running TrendCompass: ${error}`,
      error
    };
  }
}
