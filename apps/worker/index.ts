import axios from "axios";
import { prisma as prismaClient } from "store/client";
import { xReadGroup, xAckBulk } from "redis-stream/client";
import { WebsiteStatus } from "../../packages/store/generated/prisma/client";

const REGION_ID = "1";
const WORKER_ID = "1";

if (!REGION_ID || !WORKER_ID) {
  throw new Error("REGION_ID and WORKER_ID are required");
}

async function main() {
  while (1) {
    // read from the stream
    const result = await xReadGroup(REGION_ID!, WORKER_ID!);
    if (!result || result.length === 0) {
      console.log("NO RESULT ==============");
      continue;
    }

    // process the website and store the result in db
    // i ideally want this process to run in parallel and then wait for all the promises to resolve
    console.log("RESULT ==============");
    console.log(result);
    console.log("RESULT ==============");
    let promises = result.map(async ({ id, message }) =>
      fetchWebsitesById(message.url, message.id),
    );
    await Promise.all(promises);
    // be routed through a queue in a bulk DB request

    // ack back to the queue to remove the event from the stream
    await xAckBulk(
      REGION_ID!,
      result.map(({ id }) => id),
    );
  }
}

function normalizeHttpUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

async function fetchWebsitesById(url: string, websiteId: string) {
  const resolvedUrl = normalizeHttpUrl(url);
  console.log("FETCHING WEBSITE ==============");
  console.log(resolvedUrl);
  console.log(websiteId);
  console.log("FETCHING WEBSITE ==============");

  const startTime = Date.now();
  let status: WebsiteStatus;
  try {
    await axios.get(resolvedUrl);
    status = WebsiteStatus.Up;
  } catch {
    status = WebsiteStatus.Down;
  }
  const endTime = Date.now();

  const tick = await prismaClient.websiteTick.create({
    data: {
      website_id: websiteId,
      region_id: REGION_ID!,
      response_time_ms: endTime - startTime,
      status,
    },
  });

  console.log("TICK CREATED ==============");
  console.log(tick);
  console.log("TICK CREATED ==============");
}

main();
