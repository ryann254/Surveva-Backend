import QMS, {
  IQMSSchema,
  IQMSDoc,
  openAITranslationResponseObject,
} from '../mongodb/models/qms';
import { IUserDoc, IUserSchema } from '../mongodb/models/user';
import OpenAI from 'openai';
import { config, logger } from '../config';
import { zodFunction } from 'openai/helpers/zod';

/**
 * Translate polls from original language to the provided language
 * @param {string} userLanguage
 * @param {IQMSDoc} poll
 * @returns {IQMSDoc}
 */
export const translatePollOpenAi = async (
  userLanguage: string,
  poll: IQMSDoc
): Promise<IQMSDoc> => {
  const openai = new OpenAI({ apiKey: config.openAiApiSecretKey });
  const prompt = `Translate the following question: ${poll.question} and answers: ${poll.answers} to ${userLanguage}`;
  try {
    const translatedPoll = await openai.beta.chat.completions.parse({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      tools: [
        zodFunction({
          name: 'query',
          parameters: openAITranslationResponseObject,
        }),
      ],
    });
    const response =
      translatedPoll.choices[0].message.tool_calls[0].function.parsed_arguments;
    logger.info(`Open Ai Translation response: ${JSON.stringify(response)}`);
    const parsedResult = openAITranslationResponseObject.parse(response);

    poll.question = parsedResult.translatedQuestion;
    poll.answers = parsedResult.translatedAnswers;
    return poll;
  } catch (error) {
    logger.error('Failed to translate poll from open ai', error);
    return poll;
  }
};

/**
 * Fetch 10 polls that match the CLT(Category => Language => Translation) pattern
 * @param {IQMSSchema} parsedPoll
 * @param {IUserSchema} user
 * @returns {Promise<IQMSDoc[]>}
 */
export const queueMangagementSystem = async (
  parsedPoll: IQMSSchema,
  user: IUserDoc
): Promise<IQMSDoc[]> => {
  let qmsPolls: IQMSDoc[] = [];
  // LAYER 1:
  // First, fetch polls with the same category and language as the poll posted by the user.
  if (parsedPoll.category !== '') {
    const sameCategoryAndLanguagePolls = await QMS.find({
      $and: [
        { category: parsedPoll.category },
        { language: parsedPoll.language },
        { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
      ],
    }).limit(10);
    qmsPolls = qmsPolls.concat(sameCategoryAndLanguagePolls);
    logger.info(`Reached QMS LAYER 1 ${qmsPolls}`);
  }

  // LAYER 2:
  // If the `qmsPolls` are still less than 10 then, fetch polls that match the user's preferred categories and language.
  // This also applies if the AI could NOT categorize the user's poll and the category field is empty.
  if (qmsPolls.length < 10) {
    const categories = user.categories;
    // Exempt the following ids from `qmsPolls` to avoid duplicates.
    const qmsPollIds = qmsPolls.map((poll) => poll._id);
    await Promise.all(
      categories.map(async (category) => {
        if (qmsPolls.length < 10) {
          const userPreferredCategoriesAndLanguagePolls = await QMS.find({
            $and: [
              { category },
              { language: user.language },
              { _id: { $nin: qmsPollIds } },
              { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
            ],
          }).limit(10);

          // Splice the `userPreferredCategoriesAndLanguagePolls` array to ensure that it only adds the required number of polls to fill the `qmsPolls` array.
          const numPollsToAdd = 10 - qmsPolls.length;

          // Check if the `userPreferredCategoriesAndLanguagePolls` has enough polls to fill the qmsPolls
          if (userPreferredCategoriesAndLanguagePolls.length >= numPollsToAdd) {
            const removedPolls = userPreferredCategoriesAndLanguagePolls.splice(
              0,
              numPollsToAdd
            );
            qmsPolls = qmsPolls.concat(removedPolls);
          } else {
            qmsPolls = qmsPolls.concat(userPreferredCategoriesAndLanguagePolls);
          }
        }
      })
    );
    logger.info(`Reached QMS LAYER 2 ${qmsPolls}`);
  }

  // LAYER 3:
  // If the `qmsPolls` are still less than 10 then, fetch polls that match the language in the poll posted by the user.
  if (qmsPolls.length < 10) {
    const qmsPollIds = qmsPolls.map((poll) => poll._id);
    const sameLanguagePolls = await QMS.find({
      $and: [
        { language: parsedPoll.language },
        { _id: { $nin: qmsPollIds } },
        { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
      ],
    }).limit(10);

    // Do the same as the above LAYER 2 step
    const numPollsToAdd = 10 - qmsPolls.length;
    if (sameLanguagePolls.length >= numPollsToAdd) {
      const removedPolls = sameLanguagePolls.splice(0, numPollsToAdd);
      qmsPolls = qmsPolls.concat(removedPolls);
    } else {
      qmsPolls = qmsPolls.concat(sameLanguagePolls);
    }
    logger.info(`Reached QMS LAYER 3 ${qmsPolls}`);
  }

  // LAYER 4a:
  // If the `qmsPolls` are still less than 10 then, fetch polls that match the category in the poll posted by the user but a different language.
  if (qmsPolls.length < 10 && parsedPoll.category !== '') {
    const qmsPollIds = qmsPolls.map((poll) => poll._id);
    const sameCategoryDifferentLanguagePolls = await QMS.find({
      $and: [
        { category: parsedPoll.category },
        { $or: [{ language: { $ne: parsedPoll.language } }] },
        { _id: { $nin: qmsPollIds } },
        { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
      ],
    }).limit(10);

    // Translate all the `sameCategoryDifferentLanguagePolls`
    if (sameCategoryDifferentLanguagePolls.length) {
      const translatedPolls = await Promise.all(
        sameCategoryDifferentLanguagePolls.map(async (poll) => {
          const translatedPoll = await translatePollOpenAi(user.language, poll);
          return translatedPoll;
        })
      );

      if (translatedPolls.length) {
        // Do the same as the above LAYER 3 step
        const numPollsToAdd = 10 - qmsPolls.length;
        if (translatedPolls.length >= numPollsToAdd) {
          const removedPolls = translatedPolls.splice(0, numPollsToAdd);
          qmsPolls = qmsPolls.concat(removedPolls);
        } else {
          qmsPolls = qmsPolls.concat(translatedPolls);
        }
      }
    }
    logger.info(`Reached QMS LAYER 4a ${qmsPolls}`);
  }

  // LAYER 4b:
  // If the `qmsPolls` are still less than 10 then, fetch random polls and translate if necessary.
  if (qmsPolls.length < 10 && parsedPoll.category !== '') {
    const qmsPollIds = qmsPolls.map((poll) => poll._id);
    const randomPolls = await QMS.find({
      $and: [
        { _id: { $nin: qmsPollIds } },
        { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
      ],
    }).limit(10);

    const translatedPolls = await Promise.all(
      randomPolls.map(async (poll) => {
        if (poll.language !== user.language) {
          const translatedPoll = await translatePollOpenAi(user.language, poll);
          return translatedPoll;
        }
        return poll;
      })
    );

    // Do the same as the above LAYER 3 step
    const numPollsToAdd = 10 - qmsPolls.length;
    if (translatedPolls.length >= numPollsToAdd) {
      const removedPolls = translatedPolls.splice(0, numPollsToAdd);
      qmsPolls = qmsPolls.concat(removedPolls);
    } else {
      qmsPolls = qmsPolls.concat(translatedPolls);
    }
    logger.info(`Reached QMS LAYER 4b ${qmsPolls}`);
  }

  return qmsPolls;
};
