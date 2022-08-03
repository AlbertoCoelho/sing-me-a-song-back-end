import { jest } from "@jest/globals";
import { createRecommendation } from "../integration/factories/recommendation.js";
import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";

describe('recommendationService test suite', () => {

  it('recommendation must be unique', async () => {
    const createRecommendationData = await createRecommendation();

    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => { 
      return {
        name: createRecommendationData.name,
        youtubeLink: createRecommendationData.youtubeLink
      }
    });

    //jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => { });

    const promise = recommendationService.insert(createRecommendationData);
    expect(promise).rejects.toEqual({ message: "Recommendations names must be unique", type: "conflict" });
  });


  it('Must remove a recommendation that has a score lower than 5', async () => {
    const createRecommendationData = await createRecommendation();
    const removeRecommendation = { id: 1, score: -6, ...createRecommendationData};

    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(removeRecommendation);
    jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce(null);

    await recommendationService.downvote(removeRecommendation.id);

    expect(recommendationRepository.remove).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
  })

});
