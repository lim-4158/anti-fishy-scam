// Test 1: Synchronous /run endpoint — simple extraction
import "dotenv/config";

const res = await fetch("https://agent.tinyfish.ai/v1/automation/run", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.TINYFISH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://books.toscrape.com",
    goal: 'Extract the first 5 books as JSON: [{"title": string, "price": string, "rating": string}]',
  }),
});

const data = await res.json();
console.log("Status:", res.status);
console.log("Response:", JSON.stringify(data, null, 2));
