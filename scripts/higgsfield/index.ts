// Minimal Higgsfield SDK example: one Seedance 2.5 text-to-video generation.
//
//   npm run higgsfield:example
//
// Credentials: HF_CREDENTIALS="key-id:key-secret" in .env.local (git-ignored) or the
// process environment. This is a billable request (~$2.31 for 5 s at 720p, Oct 2026).
import { config, higgsfield } from "@higgsfield/client/v2";

const MODEL = "bytedance/seedance-2.5/text-to-video";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: fall back to variables already in the environment.
}

if (!process.env.HF_CREDENTIALS) {
  console.error("HF_CREDENTIALS is not set. Add it to .env.local as HF_CREDENTIALS=key-id:key-secret.");
  process.exit(1);
}

config({ credentials: process.env.HF_CREDENTIALS });

try {
  const result = await higgsfield.subscribe(MODEL, {
    input: {
      prompt: "A cinematic scene at sunset",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
    withPolling: true,
  });

  // The API also reports "canceled", which the SDK's status type does not list.
  const status: string = result.status;
  if (status === "completed" && result.video?.url) {
    console.log(`Completed (request ${result.request_id})`);
    console.log(result.video.url);
  } else {
    const reason = status === "nsfw" ? "rejected by moderation" : status === "completed" ? "completed without a video URL" : status;
    console.error(`Generation did not succeed: ${reason} (request ${result.request_id})`);
    process.exitCode = 1;
  }
} catch (error) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`Generation failed: ${message}`);
  process.exitCode = 1;
}
