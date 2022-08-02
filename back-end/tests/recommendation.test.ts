import app from '../src/app.js';
import supertest from 'supertest';
import { prisma } from '../src/database.js';
import { createRecommendation } from './factories/recommendation.js';

const agent = supertest(app);

describe("POST Integration Tests /recommendation", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "recommendations";`;
  });

  it('should return 201 and persist the recommendation given a valid body', async () => {
    const recommendation = await createRecommendation();

    const response = await agent.post("/recommendations").send(recommendation);
    const createdRecommendation = await prisma.recommendation.findFirst({
      where: { name: recommendation.name }
    });

    expect(response.status).toBe(201);
    expect(createdRecommendation).not.toBeNull();
  });

  it('should return 200 and persist the upvote given a valid recommendation', async () => {
    const recommendation = await createRecommendation();

    const insertRecommendation = await prisma.recommendation.create({
      data: recommendation
    });
    const response = await agent.post(`/recommendations/${insertRecommendation.id}/upvote`);

    const upvoteRecommendation = await prisma.recommendation.findFirst({
      where: { name: insertRecommendation.name }
    });

    expect(response.status).toBe(200);
    expect(upvoteRecommendation.score).toEqual(insertRecommendation.score + 1);
  })

  it('should return 200 and persisthe the downvote given a valid recommendation', async () => {
    const recommendation = await createRecommendation();

    const insertRecommendation = await prisma.recommendation.create({
      data: recommendation
    });
    const response = await agent.post(`/recommendations/${insertRecommendation.id}/downvote`);

    const upvoteRecommendation = await prisma.recommendation.findFirst({
      where: { name: insertRecommendation.name }
    });

    expect(response.status).toBe(200);
    expect(upvoteRecommendation.score).toEqual(insertRecommendation.score - 1);
  });
});

describe("GET Integration Tests /recommendation", () => {

});
