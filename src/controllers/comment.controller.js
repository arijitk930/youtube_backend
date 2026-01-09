import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";
import { Video } from "../models/video.model.js";
import { pipeline } from "stream";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;

  validateMongoId(videoId, "Video ID");

  const videoExists = await Video.findById(videoId);

  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (pageNumber < 1 || isNaN(pageNumber)) {
    throw new ApiError(400, "Invalid page number");
  }
  if (limitNumber < 1 || limitNumber > 100 || isNaN(limitNumber)) {
    throw new ApiError(400, "Limit must be 1 to 100");
  }

  const commentPipeline = [
    {
      $match: { video: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$owner" },
  ];

  const options = {
    page: pageNumber,
    limit: limitNumber,
    customLabels: { docs: "comments" },
  };

  const comments = await Comment.aggregatePaginate(
    Comment.aggregate(commentPipeline),
    options
  );

  if (!comments.comments || comments.comments.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "No comments found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;

  // Validate the content before saving to database:
  // 1. content exists (not null/undefined)
  // 2. content is not just empty spaces (trim() removes whitespace from both ends)
  // 3. content is actually a string type (prevents sending numbers, objects, etc.)
  if (!content || content.trim() === "" || typeof content !== "string") {
    throw new ApiError(400, "content should not be empty");
  }

  const { videoId } = req.params;
  validateMongoId(videoId, "Video ID");

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to post comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment posted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  validateMongoId(commentId, "Comment ID");

  const oldComment = await Comment.findById(commentId);

  if (!oldComment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!oldComment.owner.equals(req.user?._id)) {
    throw new ApiError(403, "You are not authorized to update the comment");
  }

  const { editedContent } = req.body;
  if (
    !editedContent ||
    editedContent.trim() === "" ||
    typeof editedContent !== "string"
  ) {
    throw new ApiError(400, "content should not be empty");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content: editedContent.trim() },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  validateMongoId(commentId, "Comment ID");

  const oldComment = await Comment.findById(commentId);

  if (!oldComment) {
    throw new ApiError(404, "comment not found");
  }

  if (!oldComment.owner.req.user?._id) {
    throw new ApiError(403, "You are not authorized to delete the comment");
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new ApiError(500, "Failed to delete the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
