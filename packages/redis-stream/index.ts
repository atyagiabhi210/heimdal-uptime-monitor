import { createClient } from "redis";

type WebsiteEvent = {
  url: string;
  id: string;
};
type MessageType = {
  id: string;
  message: {
    url: string;
    id: string;
  };
};

const STREAM_NAME = "heimdall:website";
const client = createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export async function xAdd({ url, id }: WebsiteEvent) {
  (await client).xAdd(STREAM_NAME, "*", {
    url: url,
    id: id,
  });
}

export async function xAddBulk(events: WebsiteEvent[]) {
  for (let i = 0; i < events.length; i++) {
    await xAdd(events[i]);
  }
}

export async function xReadGroup(
  consumerGroup: string,
  workerId: string,
): Promise<MessageType[]> {
  const result = await (
    await client
  ).xReadGroup(
    consumerGroup,
    workerId,
    {
      key: STREAM_NAME,
      id: ">",
    },
    {
      COUNT: 5,
    },
  );
  console.log("STREAM RESULT ==============");
  // @ts-ignore
  let messages: MessageType[] = result?.[0]?.messages ?? [];
  console.log(JSON.stringify(messages, null, 2));
  console.log("STREAM RESULT ==============");
  return messages;
}

export async function xAck(consumerGroup: string, streamId: string) {
  const result = await (await client).xAck(
    STREAM_NAME,
    consumerGroup,
    streamId,
  );
  console.log("XACK RESULT ==============");
  console.log(result);
  console.log("XACK RESULT ==============");
  return result;
}

export async function xAckBulk(consumerGroup: string, streamIds: string[]) {
  for (let i = 0; i < streamIds.length; i++) {
    await xAck(consumerGroup, streamIds[i]);
  }
}
