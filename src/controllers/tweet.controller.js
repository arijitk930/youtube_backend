import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { content } = req.body;

  if (!content || content.trim() === "" || typeof content !== "string") {
    throw new ApiError(400, "Content should not be empty");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  validateMongoId(userId, "User ID");

  const userExists = await User.exists({ _id: userId });

  if (!userExists) {
    throw new ApiError(404, "user not found");
  }

  const tweets = await Tweet.find({ owner: userId }).populate(
    "owner",
    "username avatar"
  );

  if (tweets.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "No tweets found!"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Twweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  validateMongoId(tweetId, "Tweet ID");

  const oldTweet = await Tweet.findById(tweetId);

  if (!oldTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (!oldTweet.owner.equals(req.user?._id)) {
    throw new ApiError(403, "You are not authorized to update the tweet");
  }

  const { editedContent } = req.body;

  if (
    !editedContent ||
    typeof editedContent !== "string" ||
    editedContent.trim() === ""
  ) {
    throw new ApiError(400, "Content should not be empty");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content: editedContent.trim() },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;
  validateMongoId(tweetId, "Tweet ID");

  const oldTweet = await Tweet.findById(tweetId);

  if (!oldTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (!oldTweet.owner.equals(req.user?._id)) {
    throw new ApiError(403, "You are not authorized to delete the tweet");
  }

  await oldTweet.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
