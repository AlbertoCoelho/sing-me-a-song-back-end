import { prisma } from "../../src/database.js";
import { videos } from "../infoVideos/videos.js";

export const seed = async () => {
  await prisma.recommendation.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Itsári",
      youtubeLink: "https://www.youtube.com/watch?v=nBJx1AFgtS4&list=RDnBJx1AFgtS4&start_radio=1"
    }
  });

  videos.map( async video => {
    await prisma.recommendation.upsert({
      where: { name: video.name },
      update: {},
      create: {
        name: video.name,
        youtubeLink: video.youtubeLink
      }
    });
  })

  seed().catch(e => {
    console.log(e);
    process.exit(1);
  }).finally(async () => {
    await prisma.$disconnect();
  })
}