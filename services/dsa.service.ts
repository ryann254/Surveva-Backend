import { dsaLayers } from './../config/enums';
import { DSALayers, logger } from '../config';
import QMS, { IQMSDoc } from '../mongodb/models/qms';
import ServedPoll, { IServedPollDoc } from '../mongodb/models/served_poll';
import { IUserDoc } from '../mongodb/models/user';

/**
 * Discovery Section Algorithm: Sorts polls in a specific order to serve personalized content to end users.
 * @param {string} layer
 * @param {number} categoryIndex
 * @param {IUserDoc} user
 * @returns {Promise<IQMSDoc[]>}
 */
export const discoverySectionAlgorithm = async (
  layer: string,
  categoryIndex: number,
  page: number,
  user: IUserDoc
): Promise<{ docs: IQMSDoc[] | IServedPollDoc[]; categoryIndex: number }> => {
  let dsaPolls: IQMSDoc[] | IServedPollDoc[] = [];
  let _start = (page - 1) * 10;
  // LAYER 1:
  // Fetch polls that match the user's preferred categories and language.
  // Fetch polls from both the QMS collection and Served Polls collection in the ratio of 6:4
  if (layer === DSALayers.LAYER_1) {
    // Remove categories that have already been viewed.
    let categories = user.categories.splice(
      categoryIndex,
      user.categories.length
    );
    await Promise.all(
      categories.map(async (category, index) => {
        if (dsaPolls.length < 10) {
          const qmsPreferredCategoriesAndLanguagePolls = await QMS.find({
            $and: [
              { category },
              { language: user.language },
              { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
            ],
          })
            .skip(_start)
            .limit(6);
          const servedPreferredCategoriesAndLanguagePolls =
            await ServedPoll.find({
              $and: [
                { category },
                { language: user.language },
                { isCreatedByAdmin: { $ne: true } }, // Prioritize documents where isCreatedByAdmin is false
              ],
            })
              .skip(_start)
              .limit(4);

          // Splice the `qmsPreferredCategoriesAndLanguagePolls` array to ensure that it only adds the required number of polls to fill the `dsaPolls` array.
          const numPollsToAdd = 10 - dsaPolls.length;

          // Check if the `qmsPreferredCategoriesAndLanguagePolls` has enough polls to fill the dsaPolls
          if (qmsPreferredCategoriesAndLanguagePolls.length >= numPollsToAdd) {
            const removedPolls = qmsPreferredCategoriesAndLanguagePolls.splice(
              0,
              numPollsToAdd
            );
            dsaPolls = dsaPolls.concat(removedPolls);
          } else {
            dsaPolls = dsaPolls.concat(qmsPreferredCategoriesAndLanguagePolls);
          }

          // Do the same for the `servedPreferredCategoriesAndLanguagePolls` array
          const numPollsToAdd2 = 10 - dsaPolls.length;

          if (
            servedPreferredCategoriesAndLanguagePolls.length >= numPollsToAdd2
          ) {
            const removedPolls =
              servedPreferredCategoriesAndLanguagePolls.splice(
                0,
                numPollsToAdd2
              );
            dsaPolls = dsaPolls.concat(removedPolls);
          } else {
            dsaPolls = dsaPolls.concat(
              servedPreferredCategoriesAndLanguagePolls
            );
          }
        }
        // Keep track of whether the algorithm will fetch polls from a different category.
        categoryIndex = index;
      })
    );
    logger.info(`Reached DSA LAYER 1 ${dsaPolls}`);
  }

  // LAYER 2:
  // If users don’t interact with polls from their preferred categories fetch trending polls in their geographical region.
  // Also if the above polls

  return { docs: dsaPolls, categoryIndex };
};
