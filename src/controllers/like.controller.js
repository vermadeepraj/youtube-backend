import { asyncHandler } from "../utils/asyncHandler";
import {Like, Link} from '../models/like.model.js'
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";

//---------LIKE A VIDEO------
const likeContent = asyncHandler(async(req, res)=>{
  const {videoId, commentId, tweetId} = req.body;
  const userId = req.user._id;  // Authenticated user ID

  //validating input:  Ensure only one of videoID, commentId, or tweetid id provided
  const contentTypes = [videoId, commentId, tweetId].filter(Boolean);
  if(contentTypes.length !==1){
    throw new ApiError(400, "Only one of videoId, commentId, or tweetId id allowed")
  }

  //check if the user has already liked the content
  const existingLike =await Like.findOne({
    $or: [{video: videoId}, {comment: commentId}, {tweet: tweetId}],
    likedBy: userId,
  });

  if(existingLike){
    throw new ApiError(400, "You have already liked this content");
  }
  //creating a new like
  const like = await Like.create({
    video: videoId,
    comment: commentId,
    tweet: tweetId,
    likedBy: userId
  })

  if(!like){
    throw new ApiError(500, "Failed to like the content")
  }
  return res
    .status(201)
    .json(new ApiResponse(200, like, "Content liked successfully"));
})

//------- UNLIKE  A VIDEO, COMMENT, OR TWEET----------
const unlikeContent = asyncHandler(async(req, res)=>{
  const {videoId, commentId, tweetId} = req.body
  const userId = req.user._id;

  const contentTypes = [videoId, commentId, tweetId].filter(Boolean);
  if(contentTypes.length !==1){
    throw new ApiError(400, "Only one of videoId, commentId, or tweetId id allowed")
  }

  //Find and delete the like
  const deleteLike =await Like.findOneAndDelete({
    $or:[{video: videoId, comment: commentId, tweet: tweetId}],
    likedBy: userId
  });

  if(!deleteLike){
    throw new ApiError(404, "Like not found")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deleteLike, "Content unliked successfully"))

})

//------- GET LIKES FOR A VIDEO, COMMENT, OR TWEET-------------
const getLikeForContent = asyncHandler(async(req, res)=>{
  const { videoId, commentId, tweetId } = req.query;
  //validate input
  const contentTypes = [videoId, commentId, tweetId].filter(Boolean);
  if (contentTypes.length !== 1) {
    throw new ApiError(400, "Only one of videoId, commentId, or tweetId is allowed");
  }
  //building queries
  const query = {};
  if(videoId) query.video = videoId;
  if(commentId)  query.comment = commentId;
  if(tweetId) query.tweet = tweetId;

  //fetch likes and populate the likedBy field with user details
  const likes = await Like.find(query).populate("likedBy", "username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, Likes, "Likes fetched successfully"));
})

 // ---- CHECK IF USER LIKED A VIDEO, COMMENT, OR TWEET -----------
 const checkIfUserLikedContent = asyncHandler(async(req, res)=>{
  const { videoId, commentId, tweetId } = req.query;
  const userId = req.user._id; // Authenticated user ID

   // Validate input: Ensure only one of videoId, commentId, or tweetId is provided
   const contentTypes = [videoId, commentId, tweetId].filter(Boolean);
   if (contentTypes.length !== 1) {
     throw new ApiError(400, "Only one of videoId, commentId, or tweetId is allowed");
   }

  const query = { likedBy: userId };
  if (videoId) query.video = videoId;
  if (commentId) query.comment = commentId;
  if (tweetId) query.tweet = tweetId;

  const like= await Like.findOne(query);
  return res 
   .status(200)
   .json(new ApiResponse(200, {liked: !!like}, "Liked status fetched successfully"))

 })

 export {
  likeContent,
  getLikeForContent,
  unlikeContent, 
  checkIfUserLikedContent
 }

