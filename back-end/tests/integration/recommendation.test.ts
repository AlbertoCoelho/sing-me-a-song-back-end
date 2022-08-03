import app from '../../src/app.js';
import supertest from 'supertest';
import { prisma } from '../../src/database.js';
import { createRecommendation } from './factories/recommendation.js';
import { seed } from '../../prisma/seed/seed.js';

const agent = supertest(app);

describe("POST", () => {
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

  it('should return 200 and persiste the downvote given a valid recommendation', async () => {
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
  afterAll(async () => {
    await prisma.$disconnect();
  });
  beforeAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "recommendations";`;
  });
  seed();

  it('list all recommendations', async () => {
    const response = await agent.get("/recommendations");

    expect(response.body).not.toBeNull();
  })

  it('should get a random recommendation', async () => {
    const response = await agent.get("/recommendations/random");

    expect(response.body).toHaveProperty("score");
  })

  it('should get a recommendation by id', async () => {
    const response = await agent.get(`/recommendations/1`);
    expect(response.body).toHaveProperty("name");
    expect(response.body.name).toBe("Itsári");
  })

  it('It should return a list of the 10 most voted recommendations', async () => {
    const response = await agent.get(`/recommendations/top/10`);
    expect(response.body.length).toEqual(10);
  })
});
