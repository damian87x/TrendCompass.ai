import OpenAI from "openai";
import { Story } from "../types";

/**
 * Initializes the OpenAI client
 * @param apiKey The OpenAI API key
 * @returns The OpenAI client instance
 */
export function initializeOpenAI(apiKey?: string): OpenAI | null {
  if (!apiKey) {
    console.error("OpenAI API key is not provided");
    return null;
  }
  return new OpenAI({ apiKey });
}

/**
 * Generate a post draft based on scraped stories
 * @param stories Array of stories to generate a draft from
 * @param openaiApiKey OpenAI API key
 * @returns The generated draft post
 */
export async function generateDraft(
  stories: Story[],
  openaiApiKey?: string
): Promise<string> {
  console.log(`Generating a post draft with ${stories.length} stories...`);

  try {
    const currentDate = new Date().toLocaleDateString();
    const header = `🚀 AI and LLM Trends on X for ${currentDate}\n\n`;

    if (stories.length === 0) {
      return header + "No trending stories or tweets found at this time.";
    }

    const openai = initializeOpenAI(openaiApiKey);
    if (!openai) {
      return header + "Error: OpenAI API key not configured.";
    }

    const rawStories = JSON.stringify({ stories });

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      {
        role: "system",
        content:
          "You are a helpful assistant that creates a concise, bullet-pointed draft post based on input stories and tweets. " +
          "Return strictly valid JSON that has a key 'interestingTweetsOrStories' containing an array of items. " +
          "Each item should have a 'description' and a 'story_or_tweet_link' key.",
      },
      {
        role: "user",
        content: rawStories,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "o3-mini",
      reasoning_effort: "medium",
      messages,
      store: true,
    });

    const rawJSON = completion.choices[0].message.content;
    if (!rawJSON) {
      console.log("No JSON output returned from OpenAI.");
      return header + "No output.";
    }
    console.log(rawJSON);

    const parsedResponse = JSON.parse(rawJSON);

    const contentArray =
      parsedResponse.interestingTweetsOrStories || parsedResponse.stories || [];
    if (contentArray.length === 0) {
      return header + "No trending stories or tweets found at this time.";
    }

    const draft_post =
      header +
      contentArray
        .map(
          (item: any) =>
            `• ${item.description || item.headline}\n  ${item.story_or_tweet_link || item.link}`,
        )
        .join("\n\n");

    return draft_post;
  } catch (error) {
    console.error("Error generating draft post", error);
    return "Error generating draft post.";
  }
}
