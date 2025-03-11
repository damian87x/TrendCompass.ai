import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";
import { Story } from "../types";
import axios from "axios";

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
/**
 * Scrapes GitHub's trending repositories page
 * @param url GitHub trending URL (e.g., https://github.com/trending)
 * @returns Array of stories with trending repositories
 */
export async function scrapeGitHubTrending(url: string): Promise<Story[]> {
  const stories: Story[] = [];
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    const response = await axios.get(url);
    const html = response.data;
    
    // Extract repository information from HTML
    // Looking for repository blocks in the trending page
    const repoBlocks = html.match(/<article class="Box-row">[\s\S]*?<\/article>/g);
    
    if (repoBlocks && repoBlocks.length > 0) {
      for (const block of repoBlocks) {
        // Extract repository owner and name
        const repoMatch = block.match(/href="\/([^\/]+\/[^\/"]+)"/);
        if (repoMatch) {
          const repoPath = repoMatch[1];
          const repoUrl = `https://github.com/${repoPath}`;
          
          // Extract description
          let description = '';
          const descMatch = block.match(/<p class="col-9 color-fg-muted my-1 pr-4">[\s\S]*?([^>]+)<\/p>/);
          if (descMatch) {
            description = descMatch[1].trim();
          }
          
          // Extract language if available
          let language = '';
          const langMatch = block.match(/<span itemprop="programmingLanguage">([^<]+)<\/span>/);
          if (langMatch) {
            language = langMatch[1].trim();
          }
          
          // Extract stars if available
          let stars = '';
          const starsMatch = block.match(/([\d,]+) stars/);
          if (starsMatch) {
            stars = starsMatch[1];
          }
          
          // Create story object
          const headline = `${repoPath} - ${description || 'No description'} ${language ? `[${language}]` : ''} (${stars || '0'} stars)`;
          
          stories.push({
            headline: headline,
            link: repoUrl,
            date_posted: currentDate
          });
        }
      }
    }
    
    if (stories.length === 0) {
      // Fallback: If we couldn't parse the HTML structure, create a simple story with the trending URL
      stories.push({
        headline: "GitHub Trending Repositories",
        link: url,
        date_posted: currentDate
      });
    }
  } catch (error) {
    console.error("Error scraping GitHub trending:", error);
  }
  
  return stories;
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
    
    if (source.includes("github.com/trending")) {
      try {
        console.log("Scraping GitHub trending...");
        const githubStories = await scrapeGitHubTrending(source);
        allStories.push(...githubStories);
      } catch (error) {
        console.error("Error scraping GitHub trending:", error);
      }
    }
    else if (source.includes("x.com") || source.includes("twitter.com")) {
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
