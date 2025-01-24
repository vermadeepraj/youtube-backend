import { asyncHandler } from "../utils/asyncHandler";
import {Link} from '../models/like.model.js'
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

//---------LIKE A VIDEO------
const likeVideo = asyncHandler(async(req, res)=>{
  const {videoId} = req.body;
})