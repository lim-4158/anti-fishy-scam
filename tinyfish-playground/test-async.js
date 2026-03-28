// Test 4: Async /run-async endpoint — fire and poll
import "dotenv/config";

// 1. Fire the automation
const startRes = await fetch("https://agent.tinyfish.ai/v1/automation/run-async", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.TINYFISH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://news.ycombinator.com",
    goal: 'Extract the top 5 stories as JSON: [{"title": string, "url": string, "points": string, "comments": string}]',
  }),
});

const { run_id } = await startRes.json();
console.log("Run ID:", run_id);

// 2. Poll for result
let attempts = 0;
while (attempts < 30) {
  await new Promise((r) => setTimeout(r, 2000));
  attempts++;

  const pollRes = await fetch(`https://agent.tinyfish.ai/v1/runs/${run_id}`, {
    headers: { "X-API-Key": process.env.TINYFISH_API_KEY },
  });
  const run = await pollRes.json();
  console.log(`Poll ${attempts}: ${run.status}`);

  if (run.status === "COMPLETED") {
    console.log("Result:", JSON.stringify(run.result, null, 2));
    break;
  }
  if (run.status === "FAILED" || run.status === "CANCELLED") {
    console.log("Failed:", run);
    break;
  }
}
