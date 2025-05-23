import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription (subscribe or unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id; // Assuming user ID is available from the JWT

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Check if the user is already subscribed to the channel
  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId
  });

  if (existingSubscription) {
    // Unsubscribe (delete subscription)
    await existingSubscription.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed from the channel"));
  }

  // Subscribe (create new subscription)
  const subscription = await Subscription.create({
    subscriber: userId,
    channel: channelId
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subscription, "Subscribed to the channel"));
});

// Get the list of subscribers for a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username email") // Populate with user info
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// Get the list of channels to which the user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username email") // Populate with channel info
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
};
