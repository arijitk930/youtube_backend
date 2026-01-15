import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  isSubscribed,
  getChannelSubscriberCount,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public: get subscriber COUNT (used on channel page, video page)
router.get("/count/:channelId", getChannelSubscriberCount);

// Subscribe / Unsubscribe a channel
router.post("/toggle/:channelId", verifyJWT, toggleSubscription);

// Check if logged-in user is subscribed to a channel
router.get("/is-subscribed/:channelId", verifyJWT, isSubscribed);

// Get list of channels a user has subscribed to (MY subscriptions)
router.get("/u/:subscriberId", verifyJWT, getSubscribedChannels);

// Get subscriber LIST of a channel (OWNER ONLY – My Channel → Subscribers tab)
router.get("/subscribers/:channelId", verifyJWT, getUserChannelSubscribers);

export default router;
