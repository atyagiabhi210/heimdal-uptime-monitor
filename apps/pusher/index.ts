import { prisma as prismaClient } from "store/client";
import { xAddBulk } from "redis-stream/client";
async function main() {
  let websites = await prismaClient.website.findMany({
    select: {
      url: true,
      id: true,
    },
  });
  await xAddBulk(
    websites.map((website) => ({ url: website.url, id: website.id })),
  );
  console.log(websites);
}

setInterval(() => {
  main();
}, 3 * 1000);

main();
