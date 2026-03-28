// Verbose Glassdoor test — log every field of every event
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
    proxy_config: { enabled: true, country_code: "US" },
  }),
});

console.log("HTTP Status:", res.status);
const reader = res.body.getReader();
const decoder = new TextDecoder();
let eventCount = 0;

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  for (const line of chunk.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const event = JSON.parse(line.slice(6));
      eventCount++;
      console.log(`\n--- Event ${eventCount}: ${event.type} ---`);
      console.log(JSON.stringify(event, null, 2));
    } catch {}
  }
}

console.log(`\nTotal events: ${eventCount}`);
