import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const channelId = req.user?._id;

  const stats = await Video.aggregate([
    {
      ///stage:1 filter

      $match: { owner: new mongoose.Types.ObjectId(channelId) },
    },
    {
      // Stage 2: Join with 'likes' collection to get all likes for each video

      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
        pipeline: [
          {
            $project: { likedBy: 1 },
          },
        ],
      },
    },
    {
      // Stage 3: Group all videos together and calculate totals

      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$likes" } },
      },
    },
  ]);

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const channelStats = {
    totalVideos: stats[0]?.totalVideos || 0, // Default to 0 if no videos
    totalViews: stats[0]?.totalViews || 0, // Default to 0 if no views
    totalLikes: stats[0]?.totalLikes || 0, // Default to 0 if no likes
    totalSubscribers, // Already returns 0 if no subscribers
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { page = 1, limit = 10, sortType = "desc" } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Validate page number
  if (pageNumber < 1 || isNaN(pageNumber)) {
    // Must be a positive number and not NaN (Not a Number)
    throw new ApiError(400, "Invalid page number");
  }

  // Validate limit
  if (limitNumber < 1 || limitNumber > 100 || isNaN(limitNumber)) {
    // Must be between 1 and 100 to prevent excessive data fetching
    throw new ApiError(400, "Limit must be between 1 and 100");
  }

  const sortDirection = sortType === "asc" ? 1 : -1;

  const videoPipeline = [
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user?._id) },
    },
    {
      $sort: { createdAt: sortDirection },
    },
    {
      $project: {
        videoPublicId: 0,
        thumbnailPublicId: 0,
        description: 0,
        owner: 0,
      },
    },
  ];

  const options = {
    page: pageNumber,
    limit: limitNumber,
    customLabels: { docs: "videos" },
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate(videoPipeline),
    options
  );

  if (!videos.videos || videos.videos.length === 0) {
    return res // Return response with empty videos array and pagination metadata
      .status(200)
      .json(
        new ApiResponse(
          200,
          videos, // Still includes pagination info even when empty
          "No videos found"
        )
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
