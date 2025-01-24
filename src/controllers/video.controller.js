import { asyncHandler } from "../utils/asyncHandler";
import { Video } from '../models/video.model.js'
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

import mongoose, { modelNames, Schema } from "mongoose";
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

//------updating video details --------

const updateVideo = asyncHandler(async(req, res)=>{

  const {id} = re.params;
  const {title, description, duration, isPublished} = req.body;

  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new ApiError(400, "Invalid video ID")
  }

  const updates = {};
  if(title) updates.title = title;
  if(description) updates.description = description;
  if(duration) updates.duration = duration;
  if(typeof isPublished === 'boolean') updates.isPublished = isPublished 

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

  if(videoFileLocalPath){
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if(videoFile?.url) updates.videoFile = videoFile.url;
  }

  if(thumbnailLocalPath){
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(thumbnail?.url) updates.thumbnail.url;
  }

  const video = await Video.findByIdAndUpdate(id, updates, {new:true});

  if(!video){
    throw new ApiError(404, "Video not found")
  }

  return res
  .status(201)
  .json(new ApiResponse(201, video, "Video updated successfully"))
})

//--------DELETING a video-------------
const deleteVideo = asyncHandler(async(req, res)=>{
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new ApiError( 400, "Invalid video ID")
  }

  const video = await Video.findByIdAndDelete(id);
  if(!video){
    throw new ApiError(404, "Video not found")
  }

  return res
  .status(200)
  json(new ApiResponse(200, video, "Video deleted successfully"))
})

//--------getting all the video----------
const getAllVideos = asyncHandler(async(req, res)=>{
  const {page =1, limit= 10, search = ""}=req.query;

  const pipelines = [
    {
      $match: {
        $or: [
          {title: {$regex: search, $options: "i"}},
          {description: {$regex: search, $options: "i"}}
        ]
      }
    },
    {
      $sort: {createdAt: -1}
    }
  ];

  const options = {
    page: parseInt(page, 10),
    limit:parseInt(limit, 10),
    customLabels: {
      totalDocs: 'totalVideos',
      docs: 'videos'
    },
  }

  const videos = await Video.aggregatePaginate(Video.aggregate(pipelines), options);

  return res
  .status(200)
  .json(new ApiResponse(200, videos, "Videos fetched successfully"))

})







export {
  registerVideo,
  getVideo,
  getAllVideos,
  updateVideo,
  deleteVideo
}