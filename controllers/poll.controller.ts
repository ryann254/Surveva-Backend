import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  checkForCategoryAndLanguageGeminiFlash,
  checkForCategoryAndLanguageOpenAI,
  checkForModeration,
  checkForNumberOfResponses,
  createPoll,
  deletePoll,
  getAllPolls,
  getPollById,
  searchPolls,
  servePoll,
  updatePoll,
  updatePopularityCount,
  verifyPollOwnership,
} from '../services/poll.service';
import { sendAmplitudeAnalytics } from '../utils/handleAmplitudeAnalytics';
import { QMSObject } from '../mongodb/models/qms';
import catchAsync from '../utils/catchAsync';
import { ApiError } from '../errors';
import { config, logger } from '../config';
import { queueMangagementSystem } from '../services/qms.service';
import { getUserById } from '../services/user.service';
import { IUserDoc } from '../mongodb/models/user';
import { discoverySectionAlgorithm } from '../services/dsa.service';
import pick from '../utils/pick';

export const createPollController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');

    const parsedPoll = QMSObject.parse(req.body);
    // Check for moderation using the open ai api
    const contentIsHarmful = await checkForModeration(parsedPoll.question);

    if (!contentIsHarmful) {
      // Check for category and language from the open ai api
      const updatedPoll =
        config.useOpenAi === 'true'
          ? await checkForCategoryAndLanguageOpenAI(parsedPoll)
          : await checkForCategoryAndLanguageGeminiFlash(parsedPoll);
      // Activate the QMS to fetch 10 polls.
      const user = await getUserById(req.user._id);
      const qmsPolls = await queueMangagementSystem(
        parsedPoll,
        user as IUserDoc
      );
      logger.info(`${qmsPolls.length} qmsPolls were retrieved`);
      const poll = await createPoll(updatedPoll);
      // Send `poll_created` analytic to Amplitude
      if (poll) {
        sendAmplitudeAnalytics('poll_created');
      }

      return res.status(httpStatus.CREATED).json(qmsPolls);
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message:
        'The content you have posted is potentially harmful. Edit it and try again',
    });
  }
);

export const searchPollsController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.searchTerm)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Search term is empty');

    const polls = await searchPolls(req.params.searchTerm);
    return res.status(httpStatus.OK).json(polls);
  }
);

export const updatePollController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    if (!req.params.pollId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Poll ID is required');

    const parsedPoll = QMSObject.parse(req.body);

    // Update a poll's `popularityCount` when a user clicks, votes, likes or comments on it.
    if (req.query.actionType) {
      const user = await getUserById(req.user._id);
      const result = await updatePopularityCount(
        req.params.pollId,
        req.query.actionType,
        user
      );
      const poll = await updatePoll(req.params.pollId, parsedPoll);

      // Check if poll has reached the required number of responses.
      // If yes, then move the poll to the Served Poll collection
      await checkForNumberOfResponses(poll, req.params.pollId);

      return res
        .status(httpStatus.OK)
        .json({ poll, resetCategoryIndex: result });
    }

    // Skip the AI calls if a user is clicking, voting, liking or commenting on a poll.
    if (!req.query.actionType) {
      // Check for moderation using the open ai api
      const contentIsHarmful = await checkForModeration(parsedPoll.question);

      if (!contentIsHarmful) {
        // Check for category and language from the open ai api
        const updatedPoll =
          config.useOpenAi === 'true'
            ? await checkForCategoryAndLanguageOpenAI(parsedPoll)
            : await checkForCategoryAndLanguageGeminiFlash(parsedPoll);

        const poll = await updatePoll(req.params.pollId, updatedPoll);

        // Check if poll has reached the required number of responses.
        // If yes, then move the poll to the Served Poll collection
        await checkForNumberOfResponses(poll, req.params.pollId);

        return res.status(httpStatus.OK).json(poll);
      }
      return res.status(httpStatus.BAD_REQUEST).json({
        message:
          'The content you have posted is potentially harmful. Edit it and try again',
      });
    }
  }
);

export const getAllPollsController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.query.page || !req.query.categoryIndex || !req.query.dsaLayer)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Page, Category Index and dsaLayer query parameters missing'
      );

    const user = await getUserById(req.user._id);
    const options = pick(req.query, ['page', 'categoryIndex', 'dsaLayer']);
    // Polls that have been sorted by the DSA(Discovery Section Algorithm).
    const dsaSortedPollsAndIndex = await discoverySectionAlgorithm(
      options,
      user as IUserDoc
    );
    logger.info(`${dsaSortedPollsAndIndex.docs.length} polls were retrieved`);
    return res.status(httpStatus.OK).json(dsaSortedPollsAndIndex);
  }
);

export const getPollController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.pollId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Poll ID is required');

    const poll = await getPollById(req.params.pollId);
    return res.status(httpStatus.OK).json(poll);
  }
);

export const deletePollController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.pollId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Poll ID is required');

    // Use the user's id to make sure the poll belongs to the user.
    const pollBelongsToUser = await verifyPollOwnership(req);

    if (pollBelongsToUser) {
      await deletePoll(req.params.pollId);
      return res
        .status(httpStatus.OK)
        .json({ message: 'Poll deleted successfully' });
    }
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ message: "You're Not allowed to perform this action" });
  }
);
