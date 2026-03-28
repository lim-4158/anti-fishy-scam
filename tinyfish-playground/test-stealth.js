// Test 3: Stealth mode + proxy — for bot-protected sites
import "dotenv/config";

const res = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.TINYFISH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://www.glassdoor.com/Reviews/google-reviews-SRCH_KE0,6.htm",
    goal: 'Extract the top 3 reviews as JSON: [{"rating": string, "title": string, "pros": string, "cons": string}]',
    browser_profile: "stealth",
    proxy_config: {
      enabled: true,
      country_code: "US",
    },
  }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  for (const line of chunk.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const event = JSON.parse(line.slice(6));
      console.log(`\n[${event.type}]`, event.status || "");

      if (event.type === "STREAMING_URL") {
        console.log("  Live browser:", event.streamingUrl || event.url);
      }
      if (event.type === "COMPLETE") {
        console.log("  Result:", JSON.stringify(event.resultJson, null, 2));
      }
    } catch {}
  }
}
