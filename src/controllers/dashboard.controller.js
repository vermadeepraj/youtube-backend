import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//(total videos, views, subscribers, likes)
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    // total number of videos uploaded by the channel
    const totalVideos = await Video.countDocuments({ owner: channelId });

    //total views across all the videos by the channel
    const totalViews = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ])

    //total likes across all the videos of the videos
    const totalLikes = await Like.aggregate([
        { $match: { video: { $in: await Video.find({ owner: channelId }).select("_id") } } },
        { $group: { _id: null, totalLikes: { $sum: 1 } } }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                totalVideos,
                totalViews: totalViews[0]?.totalViews || 0,
                totalSubscribers,
                totalLikes: totalLikes[0]?.totalLikes || 0
            }, "Channel stats fetched successfully.")
        );
})

// all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    // getting all the videos for the channel with pagination
    const result = await Video.aggregatePaginate(
        Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
            { $sort: { createdAt: -1 } }
        ]),
        {
            page: parseInt(page),
            limit: parseInt(limit),
            customLabels: {
                docs: "videos",
                totalDocs: "totalVideos",
                totalPages: "totalPages"
            }
        }
    )
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Channel videos fetched successfully.")
        );

})

export {
    getChannelStats,
    getChannelVideos
}