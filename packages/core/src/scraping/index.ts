import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";
import { Story } from "../types";

const StorySchema = z.object({
  headline: z.string().describe("Story or post headline"),
  link: z.string().describe("A link to the post or story"),
  date_posted: z.string().describe("The date the story or post was published"),
});

const StoriesSchema = z.object({
  stories: z
    .array(StorySchema)
    .describe("A list of today's AI or LLM-related stories"),
});

/**
 * Initializes the Firecrawl client
 * @param apiKey The Firecrawl API key
 * @returns The Firecrawl client instance
 */
export function initializeFirecrawl(apiKey?: string): FirecrawlApp | null {
  if (!apiKey) {
    console.error("Firecrawl API key is not provided");
    return null;
  }
  
  return new FirecrawlApp({ apiKey });
}

/**
 * Scrapes a single Firecrawl source for AI-related stories
 * @param app The Firecrawl client instance
 * @param source The source URL to scrape
 * @returns Array of stories scraped from the source
 */
export async function scrapeFirecrawlSource(
  app: FirecrawlApp,
  source: string
): Promise<Story[]> {
  const currentDate = new Date().toLocaleDateString();
  const promptForFirecrawl = `
Return only today's AI or LLM related story or post headlines and links in JSON format from the page content. 
They must be posted today, ${currentDate}. The format should be:
{
  "stories": [
    {
      "headline": "headline1",
      "link": "link1",
      "date_posted": "YYYY-MM-DD"
    },
    ...
  ]
}
If there are no AI or LLM stories from today, return {"stories": []}.

The source link is ${source}. 
If a story link is not absolute, prepend ${source} to make it absolute. 
Return only pure JSON in the specified format (no extra text, no markdown, no \`\`\`).
  `;

  try {
    const scrapeResult = await app.extract([source], {
      prompt: promptForFirecrawl,
      schema: StoriesSchema,
    });
    
    if (!scrapeResult.success) {
      throw new Error(`Failed to scrape: ${scrapeResult.error}`);
    }
    
    const todayStories = scrapeResult.data as { stories: Story[] };
    
    if (!todayStories || !todayStories.stories) {
      console.error(
        `Scraped data from ${source} does not have a "stories" key.`,
        todayStories
      );
      return [];
    }
    
    console.log(
      `Found ${todayStories.stories.length} stories from ${source}`
    );
    
    return todayStories.stories;
  } catch (error: any) {
    if (error.statusCode === 429) {
      console.error(
        `Rate limit exceeded for ${source}. Skipping this source.`
      );
    } else {
      console.error(`Error scraping source ${source}:`, error);
    }
    return [];
  }
}

/**
 * Scrapes Twitter/X sources for AI-related tweets
 * @param username The X/Twitter username to scrape
 * @param bearerToken The X/Twitter API bearer token
 * @returns Array of stories scraped from the Twitter/X source
 */
export async function scrapeTwitterSource(
  username: string,
  bearerToken?: string
): Promise<Story[]> {
  if (!bearerToken) {
    console.error("Twitter/X API bearer token is not provided");
    return [];
  }
  
  const tweetStartTime = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();
  
  const query = `from:${username} has:media -is:retweet -is:reply`;
  const encodedQuery = encodeURIComponent(query);
  const encodedStartTime = encodeURIComponent(tweetStartTime);
  const apiUrl = `https://api.x.com/2/tweets/search/recent?query=${encodedQuery}&max_results=10&start_time=${encodedStartTime}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(
        `Failed to fetch tweets for ${username}: ${response.statusText}`
      );
    }
    
    const tweets = await response.json();
    
    if (tweets.meta?.result_count === 0) {
      console.log(`No tweets found for username ${username}.`);
      return [];
    } else if (Array.isArray(tweets.data)) {
      console.log(`Tweets found from username ${username}`);
      
      return tweets.data.map(
        (tweet: any): Story => ({
          headline: tweet.text,
          link: `https://x.com/i/status/${tweet.id}`,
          date_posted: tweetStartTime,
        })
      );
    } else {
      console.error("Expected tweets.data to be an array:", tweets.data);
      return [];
    }
  } catch (error: any) {
    console.error(`Error fetching tweets for ${username}:`, error);
    return [];
  }
}

/**
 * Main function to scrape multiple sources
 * @param sources Array of source objects with identifiers
 * @param config Configuration object with API keys
 * @returns Combined array of stories from all sources
 */
export async function scrapeSources(
  sources: { identifier: string }[],
  firecrawlApiKey?: string,
  twitterBearerToken?: string
): Promise<Story[]> {
  const allStories: Story[] = [];
  
  const firecrawlApp = initializeFirecrawl(firecrawlApiKey);
  
  for (const sourceObj of sources) {
    const source = sourceObj.identifier;
    
    if (source.includes("x.com") || source.includes("twitter.com")) {
      const usernameMatch = source.match(/(?:x|twitter)\.com\/([^\/]+)/);
      if (usernameMatch) {
        const username = usernameMatch[1];
        const twitterStories = await scrapeTwitterSource(username, twitterBearerToken);
        allStories.push(...twitterStories);
      }
    }

    else if (firecrawlApp) {
      const firecrawlStories = await scrapeFirecrawlSource(firecrawlApp, source);
      allStories.push(...firecrawlStories);
    }
  }
  
  console.log("Combined Stories:", allStories);
  return allStories;
}
