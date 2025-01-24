import { asyncHandler } from "../utils/asyncHandler";
import { Video } from '../models/video.model.js'
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

import mongoose, { Schema } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary";



//---------REGISTER A VIDEO--------
const registerVideo = asyncHandler(async (req, res) => {
  const { title, description, owner, duration } = req.body

  if (![title, description, duration, owner].every(field => field?.trim() !== '')) {
    throw new ApiError(401, "All fields are required")
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if(!videoLocalPath  || !thumbnailLocalPath){
    throw new ApiError(401, "video file and thumbnail are required")
  }

  //upload the files on cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if(videoFile.url || !thumbnail.url){
    throw new ApiError(400, "Error uploading files to Cloudinary")
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration,
    owner
  })

  const createdVideo = await Video.findById(video._id);

  if(!createdVideo){
    throw new ApiError(500, "Something went wrong while registering a video");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, createdVideo,"Video registered Successfully"))

})

// -----------GETTING A single video

const getVideo = asyncHandler(async(req, res)=>{
  const video = await Video.findById(req.params.id);
  if(!video){
    throw new ApiError(404, "Video not found")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, video, "Video fetched successfully"));
})

//--------getting all the video----------
const getAllVideos = asyncHandler(async(req, res)=>{
  const videos = await Video.find();
  if(!videos){
    throw new ApiError(404, "Something went wrong")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, videos, "All videos fetched successfully"))
})

//------updating video details --------

const updateVideo = asyncHandler(async(req, res)=>{
  const video = await Video.findByIdAndUpdate(req.params.id, req.body, {new:true})
  if(!video){
    throw new ApiError(404,"Video not found to update details")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, video, "Video updated successfully"));
})

//--------DELETING a video-------------
const deleteVideo = asyncHandler(async(req, res)=>{
  const video = await Video.findByIdAndDelete(req.params.id);
  if(!video){
    throw new ApiError(404, "Video not found")
  }

  return res
  .status(200)
  json(new ApiResponse(200, video, "Video deleted successfully"))
})







export {
  registerVideo,
  getVideo,
  getAllVideos,
  updateVideo,
  deleteVideo
}