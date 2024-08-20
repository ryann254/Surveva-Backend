import { Types } from 'mongoose';
import { DSALayers, logger } from '../config';
import QMS, { IQMSDoc } from '../mongodb/models/qms';
import ServedPoll, { IServedPollDoc } from '../mongodb/models/served_poll';
import { IUserDoc } from '../mongodb/models/user';

/**
 * Fetch polls from a user's preferred categories and language.
 * @param {string | Types.ObjectId} category
 * @param {string} language
 * @param {number} _start
 * @param {number} limit
 * @returns {IQMSDoc[]}
 */
const fetchQMSCategoriesAndLanguagePolls = async (
  category: string | Types.ObjectId,
  language: string,
  _start: number,
  limit: number
) =>
  QMS.find({
    $and: [
      { category },
      { language },
      { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
    ],
  })
    .skip(_start)
    .limit(limit);

/**
 * Fetch polls from a user's preferred categories and language.
 * @param {string | Types.ObjectId} category
 * @param {string} language
 * @param {number} _start
 * @param {number} limit
 * @returns {IQMSDoc[]}
 */
const fetchServedCategoriesAndLanguagePolls = async (
  category: string | Types.ObjectId,
  language: string,
  _start: number,
  limit: number
) =>
  ServedPoll.find({
    $and: [
      { category },
      { language },
      { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
    ],
  })
    .skip(_start)
    .limit(limit);

/**
 * Discovery Section Algorithm: Sorts polls in a specific order to serve personalized content to end users.
 * @param {string} layer
 * @param {number} categoryIndex
 * @param {IUserDoc} user
 * @returns {Promise<IQMSDoc[]>}
 */
export const discoverySectionAlgorithm = async (
  options: Record<string, any>,
  user: IUserDoc
): Promise<{
  docs: IQMSDoc[] | IServedPollDoc[];
  categoryIndexInt: number;
}> => {
  const { dsaLayer, page, categoryIndex } = options;
  let categoryIndexInt = parseInt(categoryIndex);
  const pageInt = parseInt(page);
  let dsaPolls: IQMSDoc[] | IServedPollDoc[] = [];
  let _start = (pageInt - 1) * 10;
  // LAYER 1:
  // Fetch polls that match the user's preferred categories and language.
  // Fetch polls from both the QMS collection and Served Polls collection in the ratio of 6:4
  if (dsaLayer === DSALayers.LAYER_1) {
    // Remove categories that have already been viewed.
    let categories = user.categories.splice(
      categoryIndexInt,
      user.categories.length
    );
    await Promise.all(
      categories.map(async (category, index) => {
        if (dsaPolls.length < 10) {
          let qmsPolls = await fetchQMSCategoriesAndLanguagePolls(
            category,
            user.language,
            _start,
            6
          );
          let servedPolls = await fetchServedCategoriesAndLanguagePolls(
            category,
            user.language,
            _start,
            4
          );

          // There are some instances where servedPolls will be empty or less than 4. In those instances we will fill up the remaining slots using qmsPolls.
          if (servedPolls.length < 4) {
            const numPollsToAdd = 4 - servedPolls.length;
            qmsPolls = await fetchQMSCategoriesAndLanguagePolls(
              category,
              user.language,
              _start,
              6 + numPollsToAdd
            );
          }

          // And vice versa.
          if (qmsPolls.length < 6) {
            const numPollsToAdd = 6 - qmsPolls.length;
            servedPolls = await fetchServedCategoriesAndLanguagePolls(
              category,
              user.language,
              _start,
              4 + numPollsToAdd
            );
          }

          // Splice the `qmsPolls` array to ensure that it only adds the required number of polls to fill the `dsaPolls` array.
          const numPollsToAdd = 10 - dsaPolls.length;

          // Check if the `qmsPolls` has enough polls to fill the dsaPolls
          if (qmsPolls.length >= numPollsToAdd) {
            const removedPolls = qmsPolls.splice(0, numPollsToAdd);
            dsaPolls = dsaPolls.concat(removedPolls);
          } else {
            dsaPolls = dsaPolls.concat(qmsPolls);
          }

          // Do the same for the `servedPolls` array
          const numPollsToAdd2 = 10 - dsaPolls.length;

          if (servedPolls.length >= numPollsToAdd2) {
            const removedPolls = servedPolls.splice(0, numPollsToAdd2);
            dsaPolls = dsaPolls.concat(removedPolls);
          } else {
            dsaPolls = dsaPolls.concat(servedPolls);
          }
        }
        // Keep track of whether the algorithm will fetch polls from a different category.
        categoryIndexInt = index;
      })
    );
    logger.info(`Reached DSA LAYER 1 ${dsaPolls}`);
  }

  // LAYER 2:
  // If users don’t interact with polls from their preferred categories fetch trending polls in their geographical region.
  // Also if the above polls are less than 10, fetch the remaining polls from this layer
  if (dsaPolls.length < 10) {
    const dsaPollIds = dsaPolls.map((poll) => poll._id);
    const qmsTrendingPolls = await QMS.find({
      $and: [
        { _id: { $nin: dsaPollIds } },
        { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
      ],
    })
      .populate('owner')
      .skip(_start)
      .sort({ popularityCount: -1 })
      .limit(6);
    const servedTrendingPolls = await ServedPoll.find({
      $and: [
        { _id: { $nin: dsaPollIds } },
        { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
      ],
    })
      .populate('owner')
      .skip(_start)
      .sort({ popularityCount: -1 })
      .limit(4);

    const filteredQMSTrendingPolls = qmsTrendingPolls.filter(
      // @ts-expect-error Property location exists on poll.owner since we have populated the owner field.
      (poll) => poll.owner.location.country === user.location.country
    );
    const filteredServedTrendingPolls = servedTrendingPolls.filter(
      // @ts-expect-error Property location exists on poll.owner since we have populated the owner field.
      (poll) => poll.owner.location.country === user.location.country
    );

    // Splice the `filteredQMSTrendingPolls` array to ensure that it only adds the required number of polls to fill the `dsaPolls` array.
    const numPollsToAdd = 10 - dsaPolls.length;

    // Check if the `filteredQMSTrendingPolls` has enough polls to fill the dsaPolls
    if (filteredQMSTrendingPolls.length >= numPollsToAdd) {
      const removedPolls = filteredQMSTrendingPolls.splice(0, numPollsToAdd);
      dsaPolls = dsaPolls.concat(removedPolls);
    } else {
      dsaPolls = dsaPolls.concat(filteredQMSTrendingPolls);
    }

    // Do the same for `filteredServedTrendingPolls`.
    const numPollsToAdd2 = 10 - dsaPolls.length;

    // Check if the `filteredServedTrendingPolls` has enough polls to fill the dsaPolls
    if (filteredServedTrendingPolls.length >= numPollsToAdd2) {
      const removedPolls = filteredServedTrendingPolls.splice(
        0,
        numPollsToAdd2
      );
      dsaPolls = dsaPolls.concat(removedPolls);
    } else {
      dsaPolls = dsaPolls.concat(filteredServedTrendingPolls);
    }
    logger.info(`Reached DSA LAYER 2 ${dsaPolls}`);
  }

  return { docs: dsaPolls, categoryIndexInt };
};
