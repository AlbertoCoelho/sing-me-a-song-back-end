import { faker } from '@faker-js/faker';
import { CreateRecommendationData } from '../../../src/services/recommendationsService.js';

export const createRecommendation = async () => {
  const body: CreateRecommendationData = {
    name: faker.lorem.sentence(5),
    youtubeLink: 'https://www.youtube.com/watch?v=GayFTExPz3g&t=119s',
  }

  return body;
} 