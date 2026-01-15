import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  validateMongoId(channelId, "Channel ID");

  if (req.user._id.equals(channelId)) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const channel = await User.exists({ _id: channelId });

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  if (req.user._id.equals(channelId)) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Channel unsubscribed successfully"));
  }

  const subscription = await Subscription.create({
    subscriber: req.user?._id,
    channel: channelId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, subscription, "Channel subscribed successfully")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  validateMongoId(channelId, "Channel ID");

  const channel = await User.exists({ _id: channelId });

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscribers }, "Subscribers fetched successfully")
    );
});

const getChannelSubscriberCount = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  validateMongoId(channelId, "Channel ID");

  const channelExists = await User.exists({ _id: channelId });
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }

  const count = await Subscription.countDocuments({ channel: channelId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalSubscribers: count },
        "Subscriber count fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  validateMongoId(subscriberId, "Subscriber ID");

  const user = await User.exists({ _id: subscriberId });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!req.user?._id.equals(subscriberId)) {
    throw new ApiError(403, "Not authorised to view this user's subscriptions");
  }

  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSubscriptions: subscriptions.length,
        subscriptions,
      },
      "Subscriptions fetched successfully"
    )
  );
});

// check if current user is subscribed to a channel
const isSubscribed = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  validateMongoId(channelId, "Channel ID");

  const subscribed = await Subscription.exists({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isSubscribed: !!subscribed },
        "Subscription status fetched"
      )
    );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  isSubscribed,
  getChannelSubscriberCount,
};
