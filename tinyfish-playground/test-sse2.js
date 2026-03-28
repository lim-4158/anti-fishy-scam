// Test SSE but log the full raw event to see the actual shape
import "dotenv/config";

const res = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.TINYFISH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://quotes.toscrape.com",
    goal: 'Extract the first 3 quotes as JSON: [{"text": string, "author": string}]',
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
      // Log full event to see all fields
      console.log("\n===", event.type, "===");
      console.log(JSON.stringify(event, null, 2));
    } catch {}
  }
}
